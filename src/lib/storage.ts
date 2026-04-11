import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const useS3 =
  Boolean(process.env.AWS_S3_BUCKET) &&
  Boolean(process.env.AWS_ACCESS_KEY_ID) &&
  Boolean(process.env.AWS_SECRET_ACCESS_KEY);

let s3: S3Client | null = null;
function getS3(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3;
}

const S3_PUBLIC = process.env.AWS_S3_PUBLIC_BASE?.replace(/\/$/, "");

export type StoredFile = { url: string; key: string };

export async function saveUpload(
  file: File,
  folder: "audio" | "books" | "covers"
): Promise<StoredFile> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const safeExt = ext.match(/^[a-z0-9]+$/) ? ext : "bin";
  const key = `${folder}/${uuid()}.${safeExt}`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (useS3) {
    const bucket = process.env.AWS_S3_BUCKET!;
    await getS3().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buf,
        ContentType: file.type || "application/octet-stream",
      })
    );
    const url = S3_PUBLIC ? `${S3_PUBLIC}/${key}` : `https://${bucket}.s3.amazonaws.com/${key}`;
    return { url, key };
  }

  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${uuid()}.${safeExt}`;
  const diskPath = join(uploadDir, fileName);
  await writeFile(diskPath, buf);
  const rel = `/uploads/${folder}/${fileName}`;
  return { url: rel, key: rel };
}
