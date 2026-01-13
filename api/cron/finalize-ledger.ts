import { VercelRequest, VercelResponse } from '@vercel/node';
import { transaction, query } from '../_db';

/**
 * Finalization Engine - Cron Job Endpoint
 * 
 * Purpose: Automatically finalize pending ledger entries after their finalization window expires.
 * 
 * Architecture:
 * - Protected by CRON_SECRET header
 * - Executes in a single transaction
 * - Only updates entries that are eligible (status='pending' AND finalizes_at <= NOW())
 * - Records audit events for each finalization
 * - Immutable Ledger Principle: Only changes status, never modifies amounts or other data
 * 
 * Security:
 * - Requires x-cron-secret header matching CRON_SECRET env var
 * - No public access allowed
 * 
 * Constraints:
 * - NO modification of finalized entries
 * - NO DELETE or UPDATE of any other ledger data
 * - Write-only operation (status change only)
 * - NO database triggers (explicit logic only)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Verify CRON_SECRET
  // Support both header (for manual testing) and Authorization header (for Vercel Cron)
  // Note: Vercel Cron Jobs don't support custom headers, so we use Authorization header
  // or query parameter as fallback
  const cronSecret = 
    req.headers['x-cron-secret'] || 
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.query.secret;
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error('[FinalizeLedger] CRON_SECRET environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (cronSecret !== expectedSecret) {
    console.warn('[FinalizeLedger] Unauthorized access attempt - Invalid CRON_SECRET');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Execute finalization in a single transaction
    const result = await transaction(async (client) => {
      // Step 1: Find all eligible entries
      // Criteria: status='pending' AND finalizes_at <= NOW()
      const eligibleEntries = await client.query(
        `SELECT id, business_id, customer_id, amount, currency, entry_type, finalizes_at, created_at
         FROM ledger_entries
         WHERE status = 'pending'
           AND finalizes_at <= NOW()
         ORDER BY finalizes_at ASC
         FOR UPDATE`, // Lock rows to prevent concurrent updates
        []
      );

      const entryIds = eligibleEntries.rows.map((row: any) => row.id);
      const count = entryIds.length;

      if (count === 0) {
        // No entries to finalize
        return {
          finalizedCount: 0,
          entries: []
        };
      }

      // Store original finalizes_at values before update (for audit trail)
      const originalEntriesMap = new Map(
        eligibleEntries.rows.map((row: any) => [row.id, row])
      );

      // Step 2: Update status to 'finalized' and set finalized_at timestamp
      // CRITICAL: Only update status and finalized_at, never modify amounts or other immutable data
      const updateResult = await client.query(
        `UPDATE ledger_entries
         SET status = 'finalized',
             finalized_at = NOW()
         WHERE id = ANY($1::uuid[])
           AND status = 'pending'
           AND finalizes_at <= NOW()
         RETURNING id, business_id, customer_id, amount, currency, entry_type, finalized_at`,
        [entryIds]
      );

      const finalizedEntries = updateResult.rows;

      // Step 3: Record audit events for each finalized entry
      // Use NULL for actor_user_id since this is an automated process
      const auditPromises = finalizedEntries.map((entry: any) => {
        const originalEntry = originalEntriesMap.get(entry.id);
        return client.query(
          `INSERT INTO ledger_events (
            ledger_entry_id,
            actor_user_id,
            action,
            metadata
          ) VALUES ($1, NULL, 'auto_finalized', $2)`,
          [
            entry.id,
            JSON.stringify({
              finalized_at: entry.finalized_at,
              original_finalizes_at: originalEntry?.finalizes_at || null,
              amount: entry.amount,
              currency: entry.currency,
              entry_type: entry.entry_type,
              cron_timestamp: new Date().toISOString()
            })
          ]
        );
      });

      await Promise.all(auditPromises);

      // Step 4: Record summary events for the cron run
      // Note: ledger_events requires ledger_entry_id, so we record one event per finalized entry
      // The metadata contains the cron run summary information
      // This approach ensures we have a complete audit trail while respecting the schema constraints

      return {
        finalizedCount: finalizedEntries.length,
        entries: finalizedEntries.map((e: any) => ({
          id: e.id,
          business_id: e.business_id,
          customer_id: e.customer_id,
          amount: e.amount,
          currency: e.currency,
          entry_type: e.entry_type,
          finalized_at: e.finalized_at
        }))
      };
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Finalized ${result.finalizedCount} ledger entries`,
      data: {
        finalizedCount: result.finalizedCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[FinalizeLedger] Error:', error);
    
    // Don't expose internal errors to unauthorized callers
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to finalize ledger entries'
    });
  }
}
