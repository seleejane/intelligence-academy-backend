/**
 * Public route used by the frontend course detail page.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/courses/catalog',
      handler: 'course.findCatalog',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/courses/slugs',
      handler: 'course.findSlugs',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/courses/slug/:slug',
      handler: 'course.findBySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
