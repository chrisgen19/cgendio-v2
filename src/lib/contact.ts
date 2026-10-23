/* Shared by the contact form (client), its server action, the notification email and the admin inbox. */

export const PROJECT_TYPES = [
  {value: 'WORDPRESS', label: 'WordPress & WooCommerce'},
  {value: 'NEXTJS', label: 'Next.js & React'},
  {value: 'MIGRATION', label: 'Migration or redesign'},
  {value: 'JOB', label: 'Job opportunity'},
] as const;

export type ProjectTypeValue = (typeof PROJECT_TYPES)[number]['value'];

export const PROJECT_TYPE_VALUES = PROJECT_TYPES.map((type) => type.value) as [ProjectTypeValue, ...ProjectTypeValue[]];

export const projectTypeLabel = (value: string) => PROJECT_TYPES.find((type) => type.value === value)?.label ?? value;

export type ContactField = 'name' | 'email' | 'company' | 'projectType' | 'message';

/** What the contact action returns: success, or a form-level error and/or one message per invalid field. */
export type ContactResult = {ok: true} | {ok: false; error?: string; fieldErrors?: Partial<Record<ContactField, string>>};

/** The order fields appear in, so focus can move to the first invalid one. */
export const CONTACT_FIELDS: ContactField[] = ['name', 'email', 'company', 'projectType', 'message'];
