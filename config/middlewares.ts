import type { Core } from '@strapi/strapi';

function getNeonStorageOrigin() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.trim();

  if (!endpoint) return null;

  try {
    return new URL(endpoint).origin;
  } catch {
    return null;
  }
}

const neonStorageOrigin = getNeonStorageOrigin();
const storageSources = neonStorageOrigin ? [neonStorageOrigin] : [];
const configuredMaxFileSize = Number.parseInt(
  process.env.MEDIA_UPLOAD_MAX_BYTES ?? String(500 * 1024 * 1024),
  10
);
const maxFileSize =
  Number.isFinite(configuredMaxFileSize) && configuredMaxFileSize > 0
    ? configuredMaxFileSize
    : 500 * 1024 * 1024;

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', ...storageSources],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            ...storageSources,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            ...storageSources,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formidable: {
        maxFileSize,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
