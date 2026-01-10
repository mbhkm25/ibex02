# Cloudflare R2 Storage Integration

## Overview

This project uses **Cloudflare R2** as object storage for file uploads. Files are stored in R2, while metadata is stored in Neon PostgreSQL.

## Architecture

```
Frontend → Serverless API → R2 (Files)
                ↓
         Neon PostgreSQL (Metadata)
```

### Core Principles

- **Files live in R2** (object storage)
- **Metadata lives in Neon** (database)
- **Access is always mediated by serverless logic**
- **No shortcuts**

## Setup

### STEP 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Create bucket**
3. Name your bucket (e.g., `assets`)
4. Note your **Account ID**

### STEP 2: Create API Token

1. In R2 dashboard, go to **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions:
   - **Object Read & Write**
   - **Bucket**: Select your bucket
4. Save the **Access Key ID** and **Secret Access Key**

### STEP 3: Environment Variables

Add these to `.env.local` (local) and Vercel (production):

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=assets
```

### STEP 4: Database Migration

Run the migration to create the `files` table:

```bash
psql "$DATABASE_URL" -f database/migration_files_storage.sql
```

Or use the npm script (if added):

```bash
npm run db:migrate:files
```

## API Endpoints

### POST `/api/storage/upload-url`

Generate a signed upload URL for direct R2 upload.

**Request:**
```json
{
  "business_id": "uuid",
  "mime_type": "image/png",
  "file_size": 1024000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "objectKey": "business/{business_id}/{uuid}.{ext}",
    "bucket": "assets",
    "expiresIn": 300
  }
}
```

### POST `/api/storage/register`

Register file metadata after upload.

**Request:**
```json
{
  "object_key": "business/{business_id}/{uuid}.{ext}",
  "bucket": "assets",
  "mime_type": "image/png",
  "size": 1024000,
  "business_id": "uuid",
  "original_filename": "photo.png",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "user_id",
    "business_id": "uuid",
    "bucket": "assets",
    "object_key": "business/{business_id}/{uuid}.{ext}",
    "mime_type": "image/png",
    "size": 1024000,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Frontend Usage

### Upload File

```typescript
import { uploadFile } from './services/storage';

const file = event.target.files[0];
const result = await uploadFile({
  file,
  businessId: '11111111-1111-1111-1111-111111111111',
  originalFilename: 'photo.png',
  metadata: { category: 'product-image' }
});

console.log('File uploaded:', result.id);
```

## Security

### File Type Validation

Allowed MIME types:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `application/pdf`
- Any `image/*` type

### File Size Limits

- **Maximum size**: 5MB
- Enforced in both frontend and backend

### Access Control

- **Authentication required**: All uploads require valid JWT
- **Business ownership**: Users can only upload files for businesses they own
- **RLS enabled**: Database enforces row-level security
- **Signed URLs**: No direct credentials in frontend

## Object Key Format

Files are stored with this structure:

```
business/{business_id}/{uuid}.{ext}
```

Example:
```
business/11111111-1111-1111-1111-111111111111/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png
```

## Database Schema

### `files` Table

```sql
create table files (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null, -- User ID from Neon Auth
  business_id uuid not null references business_profiles(id),
  bucket text not null default 'assets',
  object_key text not null,
  mime_type text not null,
  size bigint not null,
  original_filename text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### RLS Policies

- **SELECT**: Users can only view files for businesses they own
- **INSERT/UPDATE/DELETE**: Blocked via Data API (must use serverless functions)

## Troubleshooting

### Error: "R2 credentials not configured"

Make sure all environment variables are set:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

### Error: "File size exceeds maximum"

Files must be ≤ 5MB. Compress images or use a different file.

### Error: "MIME type not allowed"

Only image files and PDFs are allowed. Check the allowed types list.

### Error: "You do not own this business"

Users can only upload files for businesses they own. Verify `business_id` and ownership.

## Future Enhancements

- [ ] Signed download URLs
- [ ] Image optimization/resizing
- [ ] CDN integration
- [ ] Batch upload support
- [ ] File versioning
- [ ] Automatic cleanup of orphaned files

