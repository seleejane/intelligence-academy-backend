'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/core');

const COURSE_UID = 'api::course.course';
const COURSE_SLUG = 'ai-awareness-literacy-modern-workplace';

async function uploadImage(strapi, sourcePath, name, alternativeText) {
  const existingFile = await strapi.db.query('plugin::upload.file').findOne({
    where: { name },
  });

  if (existingFile) {
    return existingFile;
  }

  const stats = fs.statSync(sourcePath);
  const uploadService = strapi.plugin('upload').service('upload');
  const [uploadedFile] = await uploadService.upload({
    data: {
      fileInfo: {
        name,
        alternativeText,
        caption: null,
      },
    },
    files: {
      filepath: sourcePath,
      originalFilename: name,
      mimetype: 'image/png',
      size: stats.size,
    },
  });

  return uploadedFile;
}

async function seedFirstCourse() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    const existingPublishedCourse = await app.documents(COURSE_UID).findFirst({
      filters: { slug: COURSE_SLUG },
      status: 'published',
    });
    const existingCourse =
      existingPublishedCourse ??
      (await app.documents(COURSE_UID).findFirst({
        filters: { slug: COURSE_SLUG },
        status: 'draft',
      }));

    if (existingCourse) {
      console.log(`Course already exists: ${existingCourse.documentId}`);
      return;
    }

    const workspaceRoot = path.resolve(__dirname, '..', '..');
    const coverSource = path.join(
      workspaceRoot,
      'frontend',
      'public',
      'images',
      'categories',
      'employees.png'
    );
    const instructorSource = path.join(
      workspaceRoot,
      'frontend',
      'public',
      'images',
      'seleejane.png'
    );

    const coverImage = await uploadImage(
      app,
      coverSource,
      'course-ai-awareness-literacy-modern-workplace.png',
      'AI Awareness and Literacy for the Modern Workplace'
    );
    const instructorImage = await uploadImage(
      app,
      instructorSource,
      'instructor-seleejana-gaelebale.png',
      'Mr Seleejana Gaelebale'
    );

    const course = await app.documents(COURSE_UID).create({
      status: 'published',
      data: {
        slug: COURSE_SLUG,
        category: 'AI for Employees',
        title: 'AI Awareness & Literacy for the Modern Workplace',
        description:
          'Build practical AI skills, understand today\u2019s tools, and learn to use artificial intelligence responsibly and productively at work.',
        coverImage: coverImage.id,
        rating: 4.9,
        reviewCount: 320,
        learnerCount: 1248,
        level: 'Beginner',
        badges: [
          { label: 'Certificate Included' },
          { label: 'Practical Exercises' },
        ],
        totalDuration: 'Approx. 8 Hours',
        totalLessons: 48,
        about: [
          {
            text: 'This comprehensive course is designed to help employees understand, navigate, and responsibly use Artificial Intelligence tools in the workplace.',
          },
          {
            text: 'You\u2019ll gain practical, hands-on experience with popular AI applications while learning best practices for security, ethics, and productivity.',
          },
        ],
        learningOutcomes: [
          { text: 'Explain AI in everyday language' },
          { text: 'Recognize major AI tools and their uses' },
          { text: 'Write clear and effective prompts' },
          { text: 'Identify hallucinations, bias, and limitations' },
          { text: 'Protect confidential data and follow security best practices' },
          { text: 'Use AI in your daily workflow' },
          { text: 'Apply human oversight and critical thinking' },
          { text: 'Understand legal and compliance considerations' },
        ],
        audiences: [
          { title: 'Employees', description: 'Across all departments' },
          { title: 'Administrators', description: 'And support staff' },
          { title: 'Managers', description: 'And team leaders' },
          {
            title: 'Customer-facing teams',
            description: 'Customer service, sales and marketing',
          },
          {
            title: 'Non-technical professionals',
            description: 'No coding experience required',
          },
        ],
        modules: [
          {
            title: 'Foundations of AI',
            duration: '45 min',
            lessons: [
              {
                title: 'What Is Artificial Intelligence?',
                duration: '07:30',
                preview: true,
              },
              { title: 'Types and Capabilities of AI', duration: '09:10' },
              { title: 'How Machine Learning Works', duration: '08:25' },
              { title: 'Neural Networks in Simple Terms', duration: '07:45' },
              { title: 'Large Language Models', duration: '08:30' },
              { title: 'Hype vs Reality', duration: '07:20' },
            ],
          },
          { title: 'AI Tool Landscape Overview', duration: '50 min', lessons: [] },
          { title: 'Prompt Engineering Basics', duration: '45 min', lessons: [] },
          { title: 'Responsible & Ethical AI Use', duration: '40 min', lessons: [] },
          { title: 'Data Privacy & Security', duration: '45 min', lessons: [] },
          { title: 'AI in Your Daily Workflow', duration: '50 min', lessons: [] },
          { title: 'Human-AI Collaboration', duration: '35 min', lessons: [] },
          {
            title: 'Legal & Compliance Considerations',
            duration: '35 min',
            lessons: [],
          },
          { title: 'Future-Proofing Your Skills', duration: '35 min', lessons: [] },
          {
            title: 'Capstone & Practical Application',
            duration: '40 min',
            lessons: [],
          },
        ],
        includes: [
          { text: '8 hours on-demand video' },
          { text: '12 downloadable resources' },
          { text: 'Practical activities and real-world exercises' },
          { text: 'Quizzes and assessments' },
          { text: 'Course workbook (PDF)' },
          { text: 'Access on desktop and mobile' },
          { text: 'Completion certificate' },
        ],
        instructor: {
          name: 'Mr Seleejana Gaelebale',
          title: 'AI Strategy & Digital Transformation Expert',
          bio: 'Mr Seleejana Gaelebale is a recognized expert in AI adoption and digital transformation, with over 15 years of experience helping organizations leverage technology for growth. He is passionate about practical, responsible AI use and making AI accessible to everyone.',
          rating: 4.9,
          reviewCount: 320,
          learnerCount: 400,
          courseCount: 12,
          image: instructorImage.id,
        },
        reviews: [
          {
            name: 'Thabo M.',
            role: 'Operations Manager',
            rating: 5,
            quote: 'This course made AI simple and practical. I now use AI tools every day at work.',
            date: '2026-09-12',
            initials: 'TM',
          },
          {
            name: 'Aisha K.',
            role: 'HR Specialist',
            rating: 5,
            quote: 'Excellent content and real-world examples. I feel more confident using AI responsibly.',
            date: '2026-08-28',
            initials: 'AK',
          },
        ],
      },
    });

    console.log(`Created and published course: ${course.documentId}`);
  } finally {
    try {
      await app.destroy();
    } catch (error) {
      // A second development process can leave a pending Neon pool operation
      // that Tarn reports as "aborted" while this one-off process shuts down.
      if (!(error instanceof Error) || error.message !== 'aborted') {
        throw error;
      }
    }
  }
}

seedFirstCourse().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
