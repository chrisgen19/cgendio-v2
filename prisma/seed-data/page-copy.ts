import type {PageCopy} from '../../src/server/content-schema';

/**
 * The canvas copy, with the facts corrected against the CV in Phase 8.1, and the About and What we build copy from the
 * section redesign. `[[...]]` marks the highlighted words in a heading.
 */
export const pageCopy: PageCopy = {
  'stack.eyebrow': 'The stack we ship with',

  'about.eyebrow': 'About',
  'about.heading': "Hi, I'm [[Christian.]]",
  'about.intro':
    "I'm a senior full-stack developer in Pasig City, Philippines. Through Cgdiomampo.dev, we take brands from research and Figma to fast WordPress and Next.js sites, then keep them running.",
  'about.name': 'Christian Diomampo',
  'about.frameLabel': 'Christian / Pasig City',
  'about.role.label': 'Role',
  'about.role.value': 'Senior full-stack developer',
  'about.role.note': 'Leads a team of 6 at Access Group Australia',
  'about.role.pin': 'Team of 6',
  'about.based.label': 'Based in',
  'about.based.value': 'Pasig City, Philippines',
  'about.based.note': 'Metro Manila',
  'about.timezone.label': 'Timezone',
  'about.timezone.value': 'UTC+8 (Asia/Manila)',
  'about.timezone.note': 'Working hours overlap Australia and APAC',
  'about.timezone.pin': 'UTC+8',
  'about.experience.label': 'On the web',
  'about.experience.value': '15+ years',
  'about.experience.note': 'Building sites since 2007',
  'about.experience.pin': '15+ years',
  'about.sites.label': 'Looks after',
  'about.sites.value': '40+ sites',
  'about.sites.note': 'WordPress and Webflow, across 40 brands',
  'about.sites.pin': '40+ sites',
  'about.status.label': 'Status',
  'about.status.open': 'Open to projects and roles',
  'about.status.closed': 'Not taking new work right now',
  'about.contactLabel': 'Get in touch',
  'about.cvLabel': 'Download CV',

  'build.eyebrow': 'What we build',
  'build.heading': 'Two kinds of site, [[both done properly]].',
  'build.wp.label': 'WordPress',
  'build.wp.labelSub': '& WooCommerce',
  'build.wp.line': 'Custom themes, plugins and WooCommerce stores, quick to load and easy for your team to edit.',
  'build.wp.proof': 'We built a membership store on WooCommerce, Stripe and MemberPress.',
  'build.next.label': 'Next.js',
  'build.next.labelSub': '& React',
  'build.next.line': 'Headless sites and React apps in TypeScript, built for speed and Core Web Vitals.',
  'build.next.proof': "We built a headless CMS on Builder.io and Next.js, and the site you're on.",

  'work.eyebrow': 'Selected work',
  'work.heading': "Things we've [[shipped.]]",

  'milestones.eyebrow': 'Achievements & milestones',
  'milestones.heading': 'Milestones, [[so far.]]',
  'milestones.lede': 'The moments that shaped how we build — from WordPress roots to full-stack product work.',

  'timeline.eyebrow': 'Work timeline',
  'timeline.heading': 'The road [[here.]]',
  'timeline.lede': 'Roles and the projects in between.',
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
