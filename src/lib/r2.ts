import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

export const isR2Configured = !!(accountId && accessKeyId && secretAccessKey && bucketName);

let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
} else {
  console.warn("Cloudflare R2 environment variables are missing. File uploads will fall back to database storage only.");
}

/**
 * Uploads a file to Cloudflare R2 bucket.
 * Falls back gracefully if R2 is not configured.
 */
export async function uploadToR2(
  key: string,
  body: string | Buffer,
  contentType: string = "text/plain"
): Promise<boolean> {
  if (!s3Client || !bucketName) {
    return false;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Failed to upload file to R2:", error);
    return false;
  }
}

/**
 * Downloads a file from Cloudflare R2 bucket.
 * Returns null if not configured or key is not found.
 */
export async function downloadFromR2(key: string): Promise<Uint8Array | null> {
  if (!s3Client || !bucketName) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    if (!response.Body) return null;
    return await response.Body.transformToByteArray();
  } catch (error) {
    console.error("Failed to download file from R2:", error);
    return null;
  }
}
