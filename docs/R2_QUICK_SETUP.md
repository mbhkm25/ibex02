# Cloudflare R2 - Quick Setup Guide

## Account Information

- **Account ID**: `889dfe1c09539566187b8b2babdc1680`
- **S3 API Endpoint**: `https://889dfe1c09539566187b8b2babdc1680.r2.cloudflarestorage.com`

## Required Environment Variables

Add these to your `.env.local` (local) and Vercel (production):

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=889dfe1c09539566187b8b2babdc1680
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_BUCKET_NAME=assets
```

## Steps to Get Access Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Manage R2 API Tokens**
3. Click **Create API Token**
4. Set permissions:
   - **Object Read & Write**
   - **Bucket**: Select your bucket (or create one named `assets`)
5. Save the **Access Key ID** and **Secret Access Key**

## Create Bucket (if not exists)

1. In R2 dashboard, click **Create bucket**
2. Name it: `assets`
3. Choose region (closest to your users)

## Verify Setup

After setting environment variables, test the upload:

1. Start your dev server: `npm run dev`
2. Navigate to business management page
3. Try uploading a logo (max 2MB, images only)
4. Check Cloudflare R2 dashboard to see the uploaded file

## File Structure in R2

Files are stored with this structure:
```
business/{business_id}/{uuid}.{ext}
```

Example:
```
business/11111111-1111-1111-1111-111111111111/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png
```

## Security Notes

- ✅ All uploads require JWT authentication
- ✅ Files are private (no public access)
- ✅ Signed URLs expire after 5 minutes
- ✅ Only business owners can upload/access files
- ✅ RLS policies enforce database-level security

## Troubleshooting

### Error: "R2 credentials not configured"
- Check that all 4 environment variables are set
- Restart dev server after adding variables

### Error: "Access Denied"
- Verify Access Key ID and Secret Access Key are correct
- Check bucket name matches `R2_BUCKET_NAME`
- Ensure API token has "Object Read & Write" permission

### Error: "Bucket not found"
- Create bucket named `assets` in Cloudflare R2 dashboard
- Or change `R2_BUCKET_NAME` to match your bucket name

