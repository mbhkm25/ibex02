import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

console.log('Testing R2 Connection...');
console.log(`Account ID: ${accountId}`);
console.log(`Bucket: ${bucketName}`);

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

async function testConnection() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });

    const response = await client.send(command);
    console.log('✅ Connection Successful!');
    console.log(`Found ${response.KeyCount || 0} objects (showing max 1).`);
    if (response.Contents && response.Contents.length > 0) {
        console.log('Sample object:', response.Contents[0].Key);
    }
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    if (error.name === 'NoSuchBucket') {
        console.error(`Hint: Bucket "${bucketName}" might not exist.`);
    } else if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
        console.error('Hint: Check your Access Key ID and Secret Access Key.');
    }
  }
}

testConnection();
