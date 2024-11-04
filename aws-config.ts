// src/aws-config.ts
import { S3Client } from "@aws-sdk/client-s3";

export const bucketName = import.meta.env.VITE_AWS_BUCKET_NAME as string;

export const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});
