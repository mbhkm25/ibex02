import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyR2() {
  console.log('🔄 Connecting to Cloudflare R2...');
  
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error('❌ Missing R2 environment variables!');
    return;
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    // 1. List Objects (Read Test)
    console.log(`📂 Checking bucket: ${bucketName}...`);
    const listCmd = new ListObjectsV2Command({ Bucket: bucketName, MaxKeys: 1 });
    await s3.send(listCmd);
    console.log('✅ READ Access: OK');

    // 2. Upload Test File (Write Test)
    const testKey = 'test-connection.txt';
    console.log(`📤 Uploading test file: ${testKey}...`);
    const uploadCmd = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: 'Hello from Ibex02 R2 Verification!',
      ContentType: 'text/plain',
    });
    await s3.send(uploadCmd);
    console.log('✅ WRITE Access: OK');

    console.log('\n🎉 R2 Connection Verified Successfully!');

  } catch (error) {
    console.error('\n❌ R2 Connection Failed:', error.message);
    if (error.name === 'NoSuchBucket') {
      console.error(`💡 Hint: The bucket "${bucketName}" does not exist. Please create it in Cloudflare Dashboard.`);
    } else if (error.name === 'SignatureDoesNotMatch' || error.name === 'InvalidAccessKeyId') {
      console.error('💡 Hint: Check your Access Key ID and Secret Access Key.');
    }
  }
}

verifyR2();
