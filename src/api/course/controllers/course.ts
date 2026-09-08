/**
 * Course controller.
 */

import { factories, type Modules } from '@strapi/strapi';

const mediaFields: Modules.Documents.Params.Fields.ArrayNotation<'plugin::upload.file'> = [
  'name',
  'alternativeText',
  'caption',
  'width',
  'height',
  'formats',
  'url',
];

const coursePopulate = {
  coverImage: {
    fields: mediaFields,
  },
  badges: true,
  about: true,
  learningOutcomes: true,
  audiences: true,
  modules: {
    populate: {
      lessons: true,
    },
  },
  includes: true,
  instructor: {
    populate: {
      image: {
        fields: mediaFields,
      },
    },
  },
  reviews: true,
  relatedCourses: {
    fields: [
      'title',
      'slug',
      'category',
      'rating',
      'reviewCount',
      'level',
      'totalLessons',
    ],
    populate: {
      coverImage: {
        fields: mediaFields,
      },
    },
  },
} satisfies Modules.Documents.Params.Populate.Any<'api::course.course'>;

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async findSlugs(ctx) {
    const courses = await strapi.documents('api::course.course').findMany({
      status: 'published',
      fields: ['slug'],
      sort: ['slug:asc'],
    });

    const sanitizedCourses = await this.sanitizeOutput!(courses, ctx);

    return this.transformResponse!(sanitizedCourses);
  },

  async findBySlug(ctx) {
    const slug = String(ctx.params.slug ?? '').trim();

    if (!slug) {
      return ctx.badRequest('A course slug is required');
    }

    const course = await strapi.documents('api::course.course').findFirst({
      filters: {
        slug: {
          $eq: slug,
        },
      },
      status: 'published',
      populate: coursePopulate,
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    const sanitizedCourse = await this.sanitizeOutput!(course, ctx);

    return this.transformResponse!(sanitizedCourse);
  },
}));
