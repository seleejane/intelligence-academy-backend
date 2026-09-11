/**
 * Portal activity controller.
 */

import { factories } from '@strapi/strapi';

const activityUid = 'api::portal-activity.portal-activity' as const;
const activityCategories = [
  'AUTHENTICATION',
  'COURSE',
  'BILLING',
  'CUSTOMER',
  'ADMINISTRATION',
  'SYSTEM',
] as const;
const actorTypes = ['CUSTOMER', 'ADMIN', 'CLERK', 'STRAPI', 'SYSTEM'] as const;
const subjectTypes = ['USER', 'COURSE', 'SUBSCRIPTION', 'PAYMENT', 'ACTIVITY', 'SYSTEM'] as const;
const activityStatuses = ['OPEN', 'REVIEWED', 'RESOLVED', 'FAILED'] as const;
const activitySeverities = ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'] as const;
const activitySources = [
  'CUSTOMER_DASHBOARD',
  'ADMIN_PORTAL',
  'CLERK_WEBHOOK',
  'STRAPI',
  'SYSTEM',
] as const;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isAuthorized(ctx: { request: { headers: Record<string, unknown> } }) {
  const configuredSecret = String(process.env.ACTIVITY_API_SECRET ?? '');
  const suppliedSecret = String(ctx.request.headers['x-activity-api-secret'] ?? '');

  return configuredSecret.length >= 32 && suppliedSecret === configuredSecret;
}

function cleanString(value: unknown, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined;
}

function cleanEnum<const TValues extends readonly string[]>(
  value: unknown,
  values: TValues,
): TValues[number] | undefined {
  const cleaned = cleanString(value, 100);
  return cleaned && (values as readonly string[]).includes(cleaned)
    ? (cleaned as TValues[number])
    : undefined;
}

function cleanJson(value: unknown): JsonValue | undefined {
  if (!value || typeof value !== 'object') return undefined;

  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return undefined;
  }
}

function cleanActivityData(input: Record<string, unknown>) {
  return {
    eventId: cleanString(input.eventId, 255),
    eventType: cleanString(input.eventType, 120),
    category: cleanEnum(input.category, activityCategories),
    summary: cleanString(input.summary, 255),
    description: cleanString(input.description, 5000),
    actorType: cleanEnum(input.actorType, actorTypes) ?? 'SYSTEM',
    actorClerkUserId: cleanString(input.actorClerkUserId, 255),
    actorEmail: cleanString(input.actorEmail, 320),
    actorName: cleanString(input.actorName, 255),
    subjectType: cleanEnum(input.subjectType, subjectTypes) ?? 'SYSTEM',
    subjectId: cleanString(input.subjectId, 255),
    courseSlug: cleanString(input.courseSlug, 255),
    courseTitle: cleanString(input.courseTitle, 255),
    status: cleanEnum(input.status, activityStatuses) ?? 'OPEN',
    severity: cleanEnum(input.severity, activitySeverities) ?? 'INFO',
    amount: typeof input.amount === 'number' ? input.amount : undefined,
    currency: cleanString(input.currency, 3)?.toUpperCase(),
    occurredAt: cleanString(input.occurredAt, 64),
    source: cleanEnum(input.source, activitySources) ?? 'SYSTEM',
    ipAddress: cleanString(input.ipAddress, 100),
    userAgent: cleanString(input.userAgent, 1000),
    metadata: cleanJson(input.metadata),
    adminNotes: cleanString(input.adminNotes, 5000),
    reviewedBy: cleanString(input.reviewedBy, 255),
    reviewedAt: cleanString(input.reviewedAt, 64),
  };
}

export default factories.createCoreController(activityUid, ({ strapi }) => ({
  async ingest(ctx) {
    if (!isAuthorized(ctx)) return ctx.unauthorized('Invalid activity API credentials');

    const rawData = (ctx.request.body?.data ?? ctx.request.body ?? {}) as Record<string, unknown>;
    const data = cleanActivityData(rawData);

    if (!data.eventId || !data.eventType || !data.category || !data.summary || !data.occurredAt) {
      return ctx.badRequest('eventId, eventType, category, summary, and occurredAt are required');
    }

    const existing = await strapi.documents(activityUid).findFirst({
      filters: { eventId: { $eq: data.eventId } },
    });

    if (existing) {
      return { data: existing, meta: { duplicate: true } };
    }

    const activityData = {
      ...data,
      eventId: data.eventId,
      eventType: data.eventType,
      category: data.category,
      summary: data.summary,
      occurredAt: data.occurredAt,
    };
    const activity = await strapi.documents(activityUid).create({ data: activityData });

    ctx.status = 201;
    return { data: activity, meta: { duplicate: false } };
  },

  async dashboard(ctx) {
    if (!isAuthorized(ctx)) return ctx.unauthorized('Invalid activity API credentials');

    const activities = await strapi.documents(activityUid).findMany({
      sort: ['occurredAt:desc'],
      limit: 5000,
    });

    return {
      data: activities,
      meta: {
        total: activities.length,
        capped: activities.length === 5000,
      },
    };
  },

  async manage(ctx) {
    if (!isAuthorized(ctx)) return ctx.unauthorized('Invalid activity API credentials');

    const documentId = cleanString(ctx.params.documentId, 255);
    const body = (ctx.request.body?.data ?? ctx.request.body ?? {}) as Record<string, unknown>;
    const status = cleanEnum(body.status, activityStatuses);
    const adminNotes = cleanString(body.adminNotes, 5000);
    const reviewedBy = cleanString(body.reviewedBy, 255);

    if (!documentId) return ctx.badRequest('An activity documentId is required');
    if (body.status !== undefined && !status) return ctx.badRequest('Invalid status');

    const activity = await strapi.documents(activityUid).update({
      documentId,
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(reviewedBy ? { reviewedBy } : {}),
        reviewedAt: new Date().toISOString(),
      },
    });

    return { data: activity };
  },
}));
