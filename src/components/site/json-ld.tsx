/** Structured data for search engines. `<` is escaped so content from the admin can never close the script tag. */
export function JsonLd({data}: {data: Record<string, unknown>}) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has to be inline JSON; the only markup character, <, is escaped
      dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}
    />
  );
}
