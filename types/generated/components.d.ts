import type { Schema, Struct } from '@strapi/strapi';

export interface CourseAudience extends Struct.ComponentSchema {
  collectionName: 'components_course_audiences';
  info: {
    displayName: 'Course Audience';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CourseBadge extends Struct.ComponentSchema {
  collectionName: 'components_course_badges';
  info: {
    displayName: 'Course Badge';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CourseCoursePreview extends Struct.ComponentSchema {
  collectionName: 'components_course_course_previews';
  info: {
    displayName: 'Course Preview';
  };
  attributes: {
    preview_url: Schema.Attribute.String;
  };
}

export interface CourseInstructor extends Struct.ComponentSchema {
  collectionName: 'components_course_instructors';
  info: {
    displayName: 'Course Instructor';
  };
  attributes: {
    bio: Schema.Attribute.Text & Schema.Attribute.Required;
    courseCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    image: Schema.Attribute.Media<'images'>;
    learnerCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    rating: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    reviewCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CourseLesson extends Struct.ComponentSchema {
  collectionName: 'components_course_lessons';
  info: {
    displayName: 'Course Lesson';
  };
  attributes: {
    duration: Schema.Attribute.String & Schema.Attribute.Required;
    link: Schema.Attribute.String;
    preview: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CourseModule extends Struct.ComponentSchema {
  collectionName: 'components_course_modules';
  info: {
    displayName: 'Course Module';
  };
  attributes: {
    duration: Schema.Attribute.String & Schema.Attribute.Required;
    lessons: Schema.Attribute.Component<'course.lesson', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CourseReview extends Struct.ComponentSchema {
  collectionName: 'components_course_reviews';
  info: {
    displayName: 'Course Review';
  };
  attributes: {
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    initials: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 4;
      }>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedParagraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_paragraphs';
  info: {
    description: 'A reusable paragraph of body copy';
    displayName: 'Paragraph';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedTextItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_items';
  info: {
    description: 'A reusable short text list item';
    displayName: 'Text Item';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'course.audience': CourseAudience;
      'course.badge': CourseBadge;
      'course.course-preview': CourseCoursePreview;
      'course.instructor': CourseInstructor;
      'course.lesson': CourseLesson;
      'course.module': CourseModule;
      'course.review': CourseReview;
      'shared.paragraph': SharedParagraph;
      'shared.text-item': SharedTextItem;
    }
  }
}
