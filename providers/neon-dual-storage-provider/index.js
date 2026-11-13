"use strict"

const {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

const MAX_SIGNED_URL_AGE_SECONDS = 7 * 24 * 60 * 60

function trimTrailingSlashes(value) {
  return value.replace(/\/+$/, "")
}

function encodeObjectKey(key) {
  return key.split("/").map(encodeURIComponent).join("/")
}

function objectPrefix(mime) {
  if (mime.startsWith("image/")) return "images"
  if (mime.startsWith("video/")) return "videos"
  if (mime.startsWith("audio/")) return "audio"

  return "files"
}

function createObjectKey(file) {
  const extension = typeof file.ext === "string" ? file.ext : ""

  return `${objectPrefix(file.mime)}/${file.hash}${extension}`
}

function validContentLength(file) {
  if (Number.isFinite(file.sizeInBytes) && file.sizeInBytes > 0) {
    return file.sizeInBytes
  }

  return undefined
}

module.exports = {
  init(options) {
    const {
      accessKeyId,
      endpoint,
      privateBucket,
      publicBucket,
      region,
      secretAccessKey,
      signedUrlExpires = 60 * 60,
    } = options

    const requiredOptions = {
      accessKeyId,
      endpoint,
      privateBucket,
      publicBucket,
      region,
      secretAccessKey,
    }

    for (const [name, value] of Object.entries(requiredOptions)) {
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`Neon upload provider requires a non-empty ${name} option.`)
      }
    }

    if (privateBucket === publicBucket) {
      throw new Error("Neon public and private bucket names must be different.")
    }

    const endpointUrl = trimTrailingSlashes(endpoint)
    const allowedBuckets = new Set([publicBucket, privateBucket])
    const expiresIn = Math.min(
      Math.max(Number.parseInt(String(signedUrlExpires), 10) || 60 * 60, 60),
      MAX_SIGNED_URL_AGE_SECONDS,
    )
    const client = new S3Client({
      endpoint: endpointUrl,
      forcePathStyle: true,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })

    function bucketForFile(file) {
      return file.mime.startsWith("image/") ? publicBucket : privateBucket
    }

    function publicObjectUrl(bucket, key) {
      return `${endpointUrl}/${encodeURIComponent(bucket)}/${encodeObjectKey(key)}`
    }

    function storedLocation(file) {
      const metadata = file.provider_metadata

      if (
        metadata &&
        typeof metadata.bucket === "string" &&
        typeof metadata.key === "string" &&
        allowedBuckets.has(metadata.bucket) &&
        metadata.key.length > 0
      ) {
        return { bucket: metadata.bucket, key: metadata.key }
      }

      if (typeof file.url !== "string" || file.url.length === 0) return null

      try {
        const endpointPath = new URL(endpointUrl).pathname.replace(/\/$/, "")
        const fileUrl = new URL(file.url)

        if (!fileUrl.pathname.startsWith(`${endpointPath}/`)) return null

        const relativePath = fileUrl.pathname.slice(endpointPath.length + 1)
        const [encodedBucket, ...encodedKeyParts] = relativePath.split("/")
        const bucket = decodeURIComponent(encodedBucket)
        const key = encodedKeyParts.map(decodeURIComponent).join("/")

        if (!allowedBuckets.has(bucket) || key.length === 0) return null

        return { bucket, key }
      } catch {
        return null
      }
    }

    function setStoredFile(file, bucket, key) {
      file.url = publicObjectUrl(bucket, key)
      file.provider_metadata = {
        bucket,
        key,
        visibility: bucket === publicBucket ? "public" : "private",
      }
    }

    async function uploadBody(file, body) {
      const bucket = bucketForFile(file)
      const key = createObjectKey(file)

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentLength: validContentLength(file),
          ContentType: file.mime,
        }),
      )

      setStoredFile(file, bucket, key)
    }

    return {
      async upload(file) {
        if (!file.buffer) throw new Error("Missing file buffer for Neon upload.")

        await uploadBody(file, file.buffer)
      },

      async uploadStream(file) {
        if (!file.stream) throw new Error("Missing file stream for Neon upload.")

        await uploadBody(file, file.stream)
      },

      async delete(file) {
        const location = storedLocation(file)

        if (!location) return

        await client.send(
          new DeleteObjectCommand({
            Bucket: location.bucket,
            Key: location.key,
          }),
        )
      },

      isPrivate() {
        return true
      },

      async getSignedUrl(file) {
        const location = storedLocation(file)

        if (!location || location.bucket === publicBucket) {
          return { url: file.url }
        }

        const url = await getSignedUrl(
          client,
          new GetObjectCommand({
            Bucket: location.bucket,
            Key: location.key,
          }),
          { expiresIn },
        )

        return { url }
      },
    }
  },
}
