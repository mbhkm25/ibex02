import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Error: R2 credentials not found in .env.local');
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  try {
    console.log('Testing R2 connection...');
    console.log(`Endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('Connection successful! Buckets:');
    response.Buckets?.forEach(bucket => {
      console.log(`- ${bucket.Name}`);
    });
    
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
