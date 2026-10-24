import type {PageCopy} from '../../src/server/content-schema';

/** The canvas copy, with the facts corrected against the CV in Phase 8.1. `[[...]]` marks the highlighted words in a heading or statement. */
export const pageCopy: PageCopy = {
  'stack.eyebrow': 'The stack we ship with',

  'about.eyebrow': 'About',
  'about.statement':
    "Hi, I'm Christian — a full-stack developer in Pasig City, Philippines. Through Cgdiomampo.dev, we take brands from research and Figma to [[fast WordPress and Next.js sites]], then keep them running.",
  'about.name': 'Christian Diomampo',
  'about.role': 'Senior full-stack developer · Pasig, PH',
  'about.fact1.title': 'Full-stack',
  'about.fact1.body': 'React, Next.js, TypeScript, PHP and WordPress — front to back.',
  'about.fact2.title': '40+ sites',
  'about.fact2.body': 'Maintained across 40 brands for Access Group Australia.',
  'about.fact3.title': 'UTC+8',
  'about.fact3.body': 'Working hours that overlap Australia and APAC.',

  'work.eyebrow': 'Selected work',
  'work.heading': "Things we've [[shipped.]]",

  'milestones.eyebrow': 'Achievements & milestones',
  'milestones.heading': 'Milestones, [[so far.]]',
  'milestones.lede': 'The moments that shaped how we build — from WordPress roots to full-stack product work.',

  'timeline.eyebrow': 'Work timeline',
  'timeline.heading': 'The road [[here.]]',
  'timeline.lede': 'Roles, promotions and the projects in between.',
  'timeline.cvLabel': 'Download CV',

  'blog.eyebrow': 'Dev notes & tech news',
  'blog.heading': 'From the [[blog.]]',
  'blog.lede': 'Field notes on migrations, Next.js, WordPress and AI-assisted development.',
  'blog.allLabel': 'All articles',

  'contact.eyebrow': 'Open to projects & roles',
  'contact.heading': 'Have a project — or a role — in mind?',
  'contact.lede': "Agencies, recruiters and founders: tell us what you're building and we'll come back with next steps.",
  'contact.primaryLabel': 'Start a project',
  'contact.cvLabel': 'Download CV',
  'contact.location': 'Pasig City, Philippines · Asia/Manila (UTC+8)',
};
