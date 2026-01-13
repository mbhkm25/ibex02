# Ledger Architecture & Financial Principles

**Status:** Active Contract
**Last Updated:** 2026-01-13

This document defines the core architectural principles for the financial ledger system in IBEX.
**These rules are non-negotiable.**

---

## 1. Finalization Engine (The "Heartbeat")

Transactions are created as `pending` and must be explicitly finalized.

### Design Pattern
- **Type:** Asynchronous Background Process (Cron Job)
- **Frequency:** Every 5-10 minutes
- **Logic:**
  ```sql
  UPDATE ledger_entries
  SET status = 'finalized'
  WHERE status = 'pending' AND finalizes_at <= NOW();
  ```
- **Audit:** Must generate `ledger_events` with action `auto_finalized`.

### ⚠️ Constraints
- **NO Triggers:** Never use DB triggers for finalization. It hides logic and complicates debugging.
- **Independence:** The process must be stoppable without affecting new transaction creation.

---

## 2. Balance Calculation (The "Source of Truth")

There is no `balance` column. Balance is a derived state.

### Formula
$$ Balance = \sum (amount) \text{ WHERE } status = 'finalized' $$

### ⚠️ Constraints
- **NO Balance Tables:** Storing balance creates race conditions and double-spending risks.
- **NO Caching (Initial Phase):** Calculate on-the-fly using indexed SQL queries.
- **Performance Scaling:**
  1. Optimized Indexes (Current)
  2. Materialized Views (Next Step)
  3. Redis Cache (High Scale)

---

## 3. Debt vs. Payment (Separation of Concerns)

While both create ledger entries, their lifecycles differ.

### Payment Flow
- **Nature:** Instant settlement attempt.
- **Endpoint:** `/api/payment-intents`
- **Logic:** `entry_type = 'payment'`

### Debt Flow (Future)
- **Nature:** Credit agreement.
- **Endpoint:** `/api/debt-requests` (Separate Endpoint)
- **Logic:** `entry_type = 'debt'`
- **Requirements:**
  - Credit Limit Check
  - Explicit Merchant Approval
  - Explicit Customer Approval
  - Due Date logic

---

## 4. Immutability & Audit

- **Ledger Entries:** Append-Only. Never DELETE. Never UPDATE amount/currency.
- **Ledger Events:** Immutable log of state changes.
- **Idempotency:** Enforced via `UNIQUE(payment_intent_id)`.

---

**Approvals:**
- Architect: [System]
- Date: 2026-01-13
