/**
 * Server-to-server activity routes. Each handler validates ACTIVITY_API_SECRET.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/portal-activities/ingest',
      handler: 'portal-activity.ingest',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/portal-activities/dashboard',
      handler: 'portal-activity.dashboard',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/portal-activities/:documentId/manage',
      handler: 'portal-activity.manage',
      config: { auth: false },
    },
  ],
};
