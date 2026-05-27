import { S3Client } from "@aws-sdk/client-s3";

import { env } from "../config/env.js";

function normalizeEndpoint(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "http://localhost:9002";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `http://${trimmed}`;
}

export function getS3Client() {
  return new S3Client({
    region: "us-east-1",
    endpoint: normalizeEndpoint(env.minioEndpoint),
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.minioAccessKey,
      secretAccessKey: env.minioSecretKey,
    },
  });
}

