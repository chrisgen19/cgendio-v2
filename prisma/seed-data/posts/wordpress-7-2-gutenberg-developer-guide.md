WordPress 7.2 ships on December 8, 2026, and Release Candidate 3 is already out for testing ([7.2 RC3](https://wordpress.org/news/2026/11/wordpress-7-2-release-candidate-3/)). Back in my [October WordPress roundup](/writing/wordpress-news-october-2026), 7.2 was still a September roadmap with a long wish list. Now that the [WordPress 7.2 Field Guide](https://make.wordpress.org/core/2026/11/20/wordpress-7-2-field-guide/) and dev notes are published, the real picture is clear: 440+ Core Trac tickets, roughly 700 enhancements and 500 bug fixes from Gutenberg 23.7 through 24.3, 21 new hooks, and a few high-profile features that did not make the cut.

I haven't upgraded any client production sites to 7.2 yet (it's still in RC), so this isn't a post-mortem. It's the developer brief I'm using to audit my own themes, plugins and client installs before December 8: what actually lands, what got pulled or delayed, what's new in Gutenberg 24.2 through 24.4, and the specific CSS, JavaScript and PHP changes that can quietly break an existing site. Every detail below comes from the official Field Guide, Make WordPress Core dev notes and WordPress.org release announcements, current as of November 26, 2026.

> **The short version.** Before you touch 7.2 RC3, make sure every live site is on **WordPress 7.1.5** (released November 18 with 20 core security fixes, including an unauthenticated Template Part privilege escalation bug). For **7.2 on December 8**, the big wins are inline SVG admin icons, a DataForm-powered editor inspector with server-side Entity Fields and Actions APIs, client-side media processing in the Media Library, new Interactivity and Abilities API additions, full PHP 8.6 support and the new Ipsum default theme. The big absences are the **Secrets API** (pulled on November 17 right before RC1), **React 19 in core** (now on by default in Gutenberg 24.2+ for plugin testing, still held back from core) and **real-time collaboration**.

## First: patch 7.1.5 before you test 7.2

If you look after live WordPress sites, 7.2 is a December 8 task, while [WordPress 7.1.5](https://wordpress.org/news/2026/11/wordpress-7-1-5-release/) (November 18) is an immediate one. It's a short-cycle security release with 20 fixes, backported to active branches back to 4.7 (with 7.2 RC2 carrying the same patches). The standouts:

- **Unauthenticated privilege escalation via Template Part block attributes** that could lead to remote code execution (reported by Logan Homolka).
- **Multisite privilege escalation** allowing a site Administrator to take over a Super Admin account through Customizer menu previews.
- **SQL injection** in `WP_Meta_Query` via nested `relation` values, plus another SQL injection via the front-page setting in Customizer changeset previews.
- **XSS fixes across core and the block editor**, including `wp_interactivity_data_wp_context()` via store namespaces, unauthenticated stored XSS via shortcode attributes in comments, and Openverse/media filename vectors. Two of the 20 fixes (a reflected XSS in the legacy media library popup and an unauthenticated REST API taxonomy disclosure) are credited to Anthropic.

One ecosystem security note from the same week: on November 22, six WP Connect plugins (including Air WP Sync and WP Sync for Notion, over 3,600 active installs combined) had a remote-control backdoor (`includes/airwp-online.php`) committed to their WordPress.org repositories ([The Hacker News](https://thehackernews.com/2026/11/wordpress-blocks-six-backdoored-wp.html), tracked as CVE-2026-135202). WordPress.org's cooldown protections under Protect The Shire caught and permanently closed all six listings before the malicious versions went live, so most sites were never served the bad zips, though it's still worth checking any site that runs WP Connect add-ons.

## What's shipping in WordPress 7.2

Here is how the 7.2 Field Guide and RC announcements break down for developers:

| Area | What ships in 7.2 | Primary dev note |
| --- | --- | --- |
| Admin UI | Inline SVG icons from `@wordpress/icons` replace Dashicons in admin bar and sidebar | [SVG icons in admin bar and menu](https://make.wordpress.org/core/2026/11/05/svg-icons-in-the-admin-bar-and-menu-in-wordpress-7-2/) |
| Editor & Site Editor | Post Inspector rebuilt with `DataForm`; PHP + JS Entity Fields and Actions APIs | [DataForm inspector](https://make.wordpress.org/core/2026/11/24/the-editor-inspector-is-now-built-with-dataform/), [Extending screens](https://make.wordpress.org/core/2026/11/24/extending-the-inspector-and-site-editor-screens-in-wordpress-7-2/) |
| Media | Client-side processing expands to Media Library grid, Add New screen and media modal; animated GIF/WebP sub-sizes | [Media changes in 7.2](https://make.wordpress.org/core/2026/11/17/media-changes-in-wordpress-7-2/) |
| Blocks & Styles | Text Shadow support, style state-aware control API, Global Styles for form elements, Ipsum default theme | [Text Shadow](https://make.wordpress.org/core/2026/11/11/new-block-support-in-wordpress-7-2-text-shadow/), [Style state controls](https://make.wordpress.org/core/2026/11/18/api-for-style-state-aware-block-styling-controls/) |
| Interactivity API | `data-wp-html` with `asDangerousHTML()`, router `state.navigating` and `state.initiator` | [Interactivity API in 7.2](https://make.wordpress.org/core/2026/11/17/changes-to-the-interactivity-api-in-wordpress-7-2/) |
| Abilities API | `required_capabilities`, schema-sanitized inputs, plus `core/content-query`, `core/users-query` and `core/settings-get` | [Abilities API updates](https://make.wordpress.org/core/2026/11/19/abilities-api-updates-in-wordpress-7-2/), [Core abilities](https://make.wordpress.org/core/2026/11/24/core-abilities-for-content-users-and-settings-in-wordpress-7-2/) |
| Routing, DB & Runtime | `/random/` redirect endpoint on by default, `NO_BACKSLASH_ESCAPES` off, jQuery Migrate 3.6.0, full PHP 8.6 support | [Random content](https://make.wordpress.org/core/2026/11/05/your-content-is-going-to-get-more-random/), [PHP 8.6](https://make.wordpress.org/core/2026/11/23/wordpress-and-php-8-6/) |

### DataForm inspector, Entity Fields and Entity Actions

This is the biggest architectural shift for plugin developers in 7.2. Both the Post Editor inspector and Site Editor inspector are now built on `DataForm`, sharing the exact same field definitions that Quick Edit uses ([DataForm dev note](https://make.wordpress.org/core/2026/11/24/the-editor-inspector-is-now-built-with-dataform/)).

Instead of injecting custom panels or fighting DOM selectors across multiple screens, WordPress 7.2 introduces two paired server-plus-client APIs ([Extending the Inspector and Site Editor screens](https://make.wordpress.org/core/2026/11/24/extending-the-inspector-and-site-editor-screens-in-wordpress-7-2/)):

- **Entity Fields API** (`wp_entity_fields_api_init`): `wp_register_entity_fields()`, `wp_update_entity_fields()`, `wp_unregister_entity_fields()`, and `wp_get_registered_entity_fields()`.
- **Entity Actions API** (`wp_entity_actions_api_init`): `wp_register_entity_actions()` and `wp_unregister_entity_actions()`.

Register a field once in PHP with its serializable metadata (`id`, `type`, `label`) and pair it with a client-side script module, and it appears across Site Editor list screens, Quick Edit and the Post Editor inspector:

```php title="register-entity-field.php"
add_action( 'init', function () {
    register_post_meta( 'page', 'demo_subtitle', array(
        'type'              => 'string',
        'single'            => true,
        'default'           => '',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    wp_register_script_module( 'demo-page-field', plugins_url( 'fields.js', __FILE__ ) );
} );

add_action( 'wp_entity_fields_api_init', function () {
    wp_register_entity_fields(
        'demo-page-field',
        'postType',
        'page',
        array(
            array(
                'id'    => 'demo_subtitle',
                'type'  => 'text',
                'label' => __( 'Subtitle', 'demo-page-field' ),
            ),
        ),
        'demo-page-field'
    );
} );
```

Existing `PluginDocumentSettingPanel` and `PluginPostStatusInfo` fills keep working, and `removeEditorPanel` still hides matching settings.

### Client-side media processing moves out of the block editor

WordPress 7.1 brought wasm-vips image processing to the block editor. In 7.2, that pipeline extends to the **Media Library grid**, the **Add New Media File** screen and the **media modal** ([Media changes in 7.2](https://make.wordpress.org/core/2026/11/17/media-changes-in-wordpress-7-2/)).

The browser requirements haven't changed: Chrome 137+ or Edge 137+ with more than 2 GB of device memory, because Firefox and Safari still don't support `Document-Isolation-Policy` and fall back to server-side processing automatically. Two new details matter in 7.2:

- **Animated GIF and WebP sub-sizes** now preserve animation on the client-side path. If you want static thumbnails instead, filter `wp_generate_animated_image_subsizes` to `false`.
- **Cross-origin output buffering is simplified.** Core stops rewriting `crossorigin` attributes across the editor page: `wp_start_cross_origin_isolation_output_buffer()` is deprecated in favor of `wp_send_document_isolation_policy_header()`, and `wp_add_crossorigin_attributes()` is deprecated with no replacement.

### Interactivity API, Abilities API and style-state controls

Three API updates worth knowing if you build custom blocks or agent-facing integrations:

- **Interactivity API (`data-wp-html`).** Previously, rendering formatted HTML from an interactive store meant mutating `innerHTML` inside a `data-wp-watch` callback, which client-side navigation could wipe out. WordPress 7.2 adds `data-wp-html`, but it intentionally refuses plain strings. Values must be wrapped with `asDangerousHTML()` in JS or `wp_interactivity_as_dangerous_html()` in PHP, and the inner subtree stays inert to Interactivity directives ([Interactivity API dev note](https://make.wordpress.org/core/2026/11/17/changes-to-the-interactivity-api-in-wordpress-7-2/)). The `core/router` store also adds `state.navigating` and `state.initiator` to replace the deprecated `hasStarted` / `hasFinished` flags.
- **Abilities API (read-only core abilities).** Abilities can now declare `required_capabilities`, sanitize inputs against their schema on both PHP and REST calls, and preserve object vs. array JSON shapes ([Abilities API updates](https://make.wordpress.org/core/2026/11/19/abilities-api-updates-in-wordpress-7-2/)). Core also ships three new read-only abilities (`core/content-query`, `core/users-query`, `core/settings-get`) as part of WordPress's agentic-web baseline ([Core abilities dev note](https://make.wordpress.org/core/2026/11/24/core-abilities-for-content-users-and-settings-in-wordpress-7-2/)).
- **Style state-aware block controls.** Custom block inspector controls can now read and write responsive viewport and pseudo-state (`:hover`, `:focus`) styles using public helpers from `@wordpress/block-editor`: `getSelectedBlockStyleState`, `hasSelectedBlockStyleState`, `getStyleForState`, and `setStyleForState` ([Style states dev note](https://make.wordpress.org/core/2026/11/18/api-for-style-state-aware-block-styling-controls/)). Block supports also add `textShadow` ([Text Shadow dev note](https://make.wordpress.org/core/2026/11/11/new-block-support-in-wordpress-7-2-text-shadow/)), Global Styles cover form elements, and the new minimal **Ipsum** default theme replaces the old year-based theme names.

### PHP 8.6 compatibility

PHP 8.6 launched on November 19, 2026, and WordPress 7.2 resolved all known core compatibility issues as of Beta 5 ([WordPress and PHP 8.6](https://make.wordpress.org/core/2026/11/23/wordpress-and-php-8-6/)). Minimum supported PHP remains 7.4.

## What's new in Gutenberg 24.2 through 24.4

WordPress 7.2 bundles **Gutenberg 23.7 through 24.3**. Gutenberg **24.4** shipped on November 12, after the 7.2 cutoff, so its changes stay in the Gutenberg plugin until 7.3. Keeping track of that boundary saves a lot of "why isn't this in RC3?" debugging:

- **Gutenberg 24.2 (October 14, in 7.2):** Notes move out of the Settings sidebar into a collapsible floating margin beside the canvas. Navigation link search now queries all content types (posts, pages, categories, tags) in one ranked list. Gallery adds ordering (including random) and block-level duotone. Roughly 80 PRs standardize design tools like min-width/height and shadows across core blocks. **React 19 turned on by default** in the Gutenberg plugin ([24.2 release post](https://make.wordpress.org/core/2026/10/14/whats-new-in-gutenberg-24-2-14-october/)).
- **Gutenberg 24.3 (October 28, in 7.2):** You can finally select and format text across multiple blocks at once. The Media Inserter is rebuilt on a DataViews grid with proper previews for audio and non-image files. Save and autosave failure notices gain a copy button and "Show/Hide details". Notes add emoji reactions and draft indicators for unsent comments ([24.3 release post](https://make.wordpress.org/core/2026/11/02/whats-new-in-gutenberg-24-3-28-october/)).
- **Gutenberg 24.4 (November 12, plugin-only for now):** Adds search and open/resolved filtering to Notes plus a compact horizontal reaction picker, PDF previews in the experimental Media Editor, stronger draft protection when restoring browser backups, wider content-only editing support, and an experimental PHP runtime for `wp-env` ([24.4 release post](https://make.wordpress.org/core/2026/11/13/whats-new-in-gutenberg-24-4-12-november/)).

## What got delayed (or pulled late)

Comparing the [September 7.2 roadmap](https://make.wordpress.org/core/2026/09/18/roadmap-to-7-2/) with what is actually in RC3, four high-profile items did not make WordPress 7.2:

1. **The Secrets API was pulled on November 17.** This was the biggest late twist of the cycle. Eric Mann even published [The Secrets API in WordPress 7.2](https://make.wordpress.org/core/2026/11/11/the-secrets-api-in-wordpress-7-2/) on November 11 covering `wp_set_secret()`, `wp_get_secret()` and `WP_SECRETS_KEY`. Six days later, right ahead of RC1, core reverted Trac `#66187` in changeset `r65538` after review raised missing capability checks on writes and the same architectural tension Ryan McCue flagged back in August: whether a database-encrypted store should share an API with host-managed secret providers. If you prototyped against early 7.2 betas or added a `secrets.php` drop-in, remove that code and stick to your existing credential storage for now.
2. **React 19 is still not in WordPress Core.** Core originally aimed to ship React 19 in 7.1, reverted it in July after plugin clashes, and moved it behind an experiment flag in Gutenberg 23.4 ([React 19 punt note](https://make.wordpress.org/core/2026/07/24/react-19-punted-beyond-wordpress-7-1-experiment-in-gutenberg/)). Gutenberg 24.2 turned React 19 on by default inside the plugin so the ecosystem could test it at scale, while WordPress 7.2 Core stays on React 18.3.
3. **Real-time collaboration (RTC) remains off the roadmap.** After being pulled from 7.0 over server load and race conditions, live co-editing was intentionally kept off 7.2. Phase 3 progress in 7.2 is asynchronous editorial workflow through Notes.
4. **Sudo mode and experimental blocks.** Sudo mode (re-authentication before privileged actions) did not land in 7.2, and experimental Gutenberg blocks such as Table of Contents and Description List remain in the Gutenberg plugin rather than core.

## Breaking changes and migration gotchas

Most WordPress sites will update cleanly to 7.2, but if you maintain custom admin themes, block plugins, agency starter kits or client integrations, these are the six places where 7.2 (and Gutenberg's React 19 switch) can bite.

### 1. Inline SVG admin icons replace Dashicons `::before`

WordPress 7.2 swaps the Dashicons font glyphs in the admin bar and sidebar menu for inline SVGs from `@wordpress/icons` ([SVG icons dev note](https://make.wordpress.org/core/2026/11/05/svg-icons-in-the-admin-bar-and-menu-in-wordpress-7-2/)).

Registering custom menu pages and admin bar nodes with Dashicons still works as before. What breaks is **custom CSS that styles, hides or replaces core icons through `::before`**, plus PHP that inspects `$wp_admin_bar->get_node()->title` expecting an empty `<span class="ab-icon">` (core nodes now pass icons via the new `icon` argument instead, except `wp-logo`).

Update custom admin color schemes and icon overrides so they style both the element (which the SVG inherits from) and `::before` (for pre-7.2 compatibility):

```css title="admin-color-scheme-fix.css"
/* Before: stops styling core SVG icons in WordPress 7.2 */
#adminmenu div.wp-menu-image::before { color: #c3c4c7; }
#wpadminbar li:hover .ab-icon::before { color: #72aee6; }
#wpadminbar #wp-admin-bar-edit > .ab-item::before { display: none; }

/* After: works on WordPress 7.2 and earlier */
#adminmenu div.wp-menu-image,
#adminmenu div.wp-menu-image::before { color: #c3c4c7; }

#wpadminbar li:hover .ab-icon,
#wpadminbar li:hover .ab-icon::before { color: #72aee6; }

#wpadminbar #wp-admin-bar-edit > .ab-item::before,
#wpadminbar #wp-admin-bar-edit > .ab-item .ab-icon { display: none; }
```

Two more CSS traps called out in the dev note:

- **Replacing a core icon with a background image** while setting `color: transparent` relied on core's `::before` `content` to size the box. Set explicit `content: ""` and `width`/`height` (or `background: url(...) center / 20px 20px no-repeat`).
- **Overriding admin bar icons on `.ab-item::before`** (`edit`, `customize`, `site-editor`, `my-sites`, `site-name`, `my-account`) now needs `.ab-item .ab-icon::before` as well, or core's SVG shows instead.

If you want to opt your own plugin menus and admin bar items into core's new `core-admin` SVG collection while staying compatible with 7.1 and earlier, gate menu icons with `wp_is_valid_icon_name()` (and don't use the `core` collection in wp-admin, as themes/plugins may unregister front-end icons):

```php title="register-svg-admin-icon.php"
add_menu_page(
    __( 'Notes', 'my-plugin' ),
    __( 'Notes', 'my-plugin' ),
    'manage_options',
    'my-plugin-notes',
    'my_plugin_render_notes',
    function_exists( 'wp_is_valid_icon_name' ) ? 'core-admin/pin' : 'dashicons-admin-post'
);

add_action( 'admin_bar_menu', function ( WP_Admin_Bar $wp_admin_bar ) {
    $wp_admin_bar->add_node( array(
        'id'    => 'my-plugin-notes',
        'icon'  => 'core-admin/pin', // Ignored on < 7.2
        'title' => __( 'Notes', 'my-plugin' ),
        'href'  => admin_url( 'admin.php?page=my-plugin-notes' ),
    ) );
}, 100 );
```

### 2. React 19 in Gutenberg 24.2+ (and preparing for core)

Even though WordPress 7.2 core keeps React 18.3, any site running the Gutenberg plugin (24.2+) is already running React 19 by default, and core will follow once ecosystem compatibility holds up.

According to Jarda Snajdr's [React 19 upgrade guide](https://make.wordpress.org/core/2026/05/27/react-19-upgrade-in-wordpress/) and [July punt post](https://make.wordpress.org/core/2026/07/24/react-19-punted-beyond-wordpress-7-1-experiment-in-gutenberg/), the #1 cause of broken plugins isn't exotic React code: it's **bundling `react/jsx-runtime` directly into the plugin's JS bundle** instead of externalizing it to WordPress's `react-jsx-runtime` script (which `@wordpress/scripts` handles for you). Mixing a bundled React 18 JSX runtime with WordPress's React 19 runtime breaks element internals immediately.

Audit custom blocks and React admin screens for the removed APIs now:

```jsx title="react-19-migrations.jsx"
// 1. Replace render() / unmountComponentAtNode() with createRoot()
import { createRoot } from '@wordpress/element';

const root = createRoot( document.getElementById( 'my-plugin-root' ) );
root.render( <App /> );
// Later: root.unmount();

// 2. Replace function component defaultProps with JS default parameters
function Badge( { size = 100 } ) {
    return <div style={ { width: size } } />;
}
```

Also check for `ReactDOM.findDOMNode()` (removed from `react-dom`; only polyfilled on `@wordpress/element` for now, so move to refs), string refs on class components, and legacy `contextTypes` / `childContextTypes`.

### 3. Bundled `@wordpress/*` CSS module class name collisions

If your plugin bundles its own copy of certain `@wordpress/*` UI packages instead of loading shared core scripts, a bug in `@wordpress/build` caused different versions of the same package to emit identical CSS module class names, so two copies on the same screen overwrite each other's styles ([CSS module collisions dev note](https://make.wordpress.org/core/2026/11/16/update-bundled-wordpress-packages-and-wordpress-build-to-fix-css-module-class-name-collisions/)).

Before WordPress 7.2 lands, bump any bundled copy to at least these versions and rebuild:

| Package | First fixed version |
| --- | --- |
| `@wordpress/ui` | `0.26.0` |
| `@wordpress/dataviews` | `22.0.0` |
| `@wordpress/admin-ui` | `3.1.0` |
| `@wordpress/grid` | `0.11.0` |
| `@wordpress/components` (only if bundled; `wp-components` in 7.2 is already fixed) | `44.0.0` |
| `@wordpress/build` (if compiling your own CSS modules) | `0.27.0` |

### 4. Editor and DataForm removals

Several editor deprecations finish their lifecycle in 7.2 ([Miscellaneous Editor Changes](https://make.wordpress.org/core/2026/11/18/miscellaneous-editor-changes-in-wordpress-7-2/) and [DataForm dev note](https://make.wordpress.org/core/2026/11/24/the-editor-inspector-is-now-built-with-dataform/)):

- **`__experimentalGroup` removed from `InspectorControls`.** Rename it to `group` (works since WordPress 6.2, or use `InspectorAdvancedControls` for the Advanced panel). Leaving `__experimentalGroup` dumps controls out of their intended panel into the default group.
- **`wp.editPost.__experimentalPluginPostExcerpt` is no longer rendered.** Because the excerpt is now a DataForm field rather than a panel, move custom excerpt UI into a `PluginDocumentSettingPanel` or register a field via the Entity Fields API.
- **`__experimentalImageEditor` stylesheet moved** from `@wordpress/block-library` to `@wordpress/block-editor`.
- **Additional CSS now applies to parent-rendered blocks** (such as Navigation Links inside a Navigation block). Any forgotten CSS rules sitting in a Navigation Link's Advanced panel that never rendered before will suddenly go live in 7.2.
- **Paragraph mobile multi-selection** moves `contenteditable` to the canvas wrapper; plugins filtering `editor.BlockListBlock` to attach keyboard/input listeners to Paragraph blocks still get a pseudo-SyntheticEvent, though the native event target is now the canvas.
- **`registry.subscribe( listener, storeName )`** no longer fires on unrelated stores before `storeName` is registered.

### 5. `/random/` rewrite endpoint, `WP_DEBUG`, Application Passwords and SQL mode

A handful of core defaults change in 7.2 ([Random content dev note](https://make.wordpress.org/core/2026/11/05/your-content-is-going-to-get-more-random/), [Misc Developer Changes](https://make.wordpress.org/core/2026/11/19/miscellaneous-developer-changes-in-wordpress-7-2/), [SQL mode dev note](https://make.wordpress.org/core/2026/10/09/no_backslash_escapes-sql-mode-is-now-turned-off-by-default-in-wordpress-7-2/)):

- **`/random/` is on by default.** WordPress 7.2 registers `/random/`, `/random/category/{slug}/`, `/random/author/{slug}/`, and `/random/{cpt-slug}/` for any public post type with `has_archive`. If a client site already has a `/random/` page, strict crawl-budget rules, or an edge cache that shouldn't chase `ORDER BY RAND()` queries, disable it or opt CPTs out:

```php title="disable-random-redirect.php"
// Disable /random/ redirects and rewrite rules site-wide (best in an mu-plugin)
add_filter( 'wp_enable_random_content_redirect', '__return_false' );

// Or opt a single custom post type out
register_post_type( 'case_study', array(
    'public'      => true,
    'has_archive' => true,
    'randomable'  => false,
) );
```

- **`WP_DEBUG` now defaults to `true` when `WP_ENVIRONMENT_TYPE` is `local`** (and `WP_DEBUG` isn't explicitly defined in `wp-config.php`). Local environments will start printing PHP notices and deprecation warnings unless you define `WP_DEBUG` or turn off `WP_DEBUG_DISPLAY`.
- **Application Password hooks now receive unslashed data**, and WordPress emails the user whenever an application password is created. Remove any manual `wp_unslash()` inside callbacks on `wp_create_application_password` or `wp_update_application_password` so you don't strip legitimate backslashes, and disable core's email via `wp_send_application_password_created_email` if your plugin already sends one.
- **`NO_BACKSLASH_ESCAPES` SQL mode** is now stripped automatically in `wpdb::set_sql_mode()` so servers with that mode enabled don't corrupt backslash-escaped queries.

### 6. Preparing for jQuery 4 (jQuery Migrate 3.6.0)

WordPress 7.2 does not upgrade jQuery to 4.0 yet, but it ships **jQuery Migrate 3.6.0** specifically to surface console deprecation warnings for APIs jQuery 4 removes ([Preparing for jQuery 4](https://make.wordpress.org/core/2026/11/17/preparing-for-jquery-4-with-wordpress-7-2/)). The tentative plan is jQuery 4 + updated jQuery UI in **WordPress 7.3**, and disabling jQuery Migrate by default at the end of 2027 (7.5 or 7.6). Watching browser consoles during 7.2 staging tests gives you a full release cycle to clean up old jQuery code before 7.3 breaks it.

## What I'd do before December 8

1. **Confirm every live site is on WordPress 7.1.5** (or the matching backport on older branches) and verify no site runs the six permanently closed WP Connect plugins.
2. **Spin up 7.2 RC3 on staging** (`wp core update --version=7.2-RC3`) and open the browser console across both front-end and wp-admin to catch jQuery Migrate 3.6.0 warnings and any `WP_DEBUG` notices on `local` environments.
3. **Audit custom admin CSS and plugins** for `::before` rules targeting `#adminmenu` or `#wpadminbar`, `__experimentalGroup` on `InspectorControls`, `__experimentalPluginPostExcerpt`, and bundled `@wordpress/*` packages that need bumping for CSS module collisions.
4. **Decide on `/random/`** for client sites with custom post types, SEO crawl rules or aggressive page caching, and add `wp_enable_random_content_redirect` or `'randomable' => false` where it doesn't belong.
5. **Check client sites for forgotten Additional CSS** on Navigation Links or other parent-rendered blocks that will suddenly take effect in 7.2.
6. **Install Gutenberg 24.4 on a dev site** to test your custom blocks and React admin pages against React 19 now, especially making sure `react/jsx-runtime` is externalized rather than bundled.
7. **Remove any beta Secrets API code** (`wp_set_secret()`, `wp_get_secret()`, `WP_SECRETS_KEY`) if you experimented with early 7.2 betas.

## Sources

**WordPress.org**

- [WordPress 7.2 Release Candidate 3](https://wordpress.org/news/2026/11/wordpress-7-2-release-candidate-3/) and [Release Candidate 1](https://wordpress.org/news/2026/11/wordpress-7-2-release-candidate-1/)
- [WordPress 7.1.5 Release](https://wordpress.org/news/2026/11/wordpress-7-1-5-release/)

**Make WordPress Core (7.2 Field Guide and Dev Notes)**

- [WordPress 7.2 Field Guide](https://make.wordpress.org/core/2026/11/20/wordpress-7-2-field-guide/) and [Roadmap to 7.2](https://make.wordpress.org/core/2026/09/18/roadmap-to-7-2/)
- [SVG icons in the admin bar and menu in WordPress 7.2](https://make.wordpress.org/core/2026/11/05/svg-icons-in-the-admin-bar-and-menu-in-wordpress-7-2/)
- [The editor inspector is now built with DataForm](https://make.wordpress.org/core/2026/11/24/the-editor-inspector-is-now-built-with-dataform/) and [Extending the Inspector and Site Editor screens in WordPress 7.2](https://make.wordpress.org/core/2026/11/24/extending-the-inspector-and-site-editor-screens-in-wordpress-7-2/)
- [Update bundled @wordpress/* packages and @wordpress/build to fix CSS module class name collisions](https://make.wordpress.org/core/2026/11/16/update-bundled-wordpress-packages-and-wordpress-build-to-fix-css-module-class-name-collisions/)
- [Media changes in WordPress 7.2](https://make.wordpress.org/core/2026/11/17/media-changes-in-wordpress-7-2/)
- [Changes to the Interactivity API in WordPress 7.2](https://make.wordpress.org/core/2026/11/17/changes-to-the-interactivity-api-in-wordpress-7-2/)
- [Abilities API updates in WordPress 7.2](https://make.wordpress.org/core/2026/11/19/abilities-api-updates-in-wordpress-7-2/) and [Core abilities for content, users, and settings in WordPress 7.2](https://make.wordpress.org/core/2026/11/24/core-abilities-for-content-users-and-settings-in-wordpress-7-2/)
- [API for style state-aware block styling controls](https://make.wordpress.org/core/2026/11/18/api-for-style-state-aware-block-styling-controls/) and [New Block Support in WordPress 7.2: Text Shadow](https://make.wordpress.org/core/2026/11/11/new-block-support-in-wordpress-7-2-text-shadow/)
- [Your Content Is Going To Get More Random!](https://make.wordpress.org/core/2026/11/05/your-content-is-going-to-get-more-random/)
- [NO_BACKSLASH_ESCAPES SQL mode is now turned off by default in WordPress 7.2](https://make.wordpress.org/core/2026/10/09/no_backslash_escapes-sql-mode-is-now-turned-off-by-default-in-wordpress-7-2/)
- [Preparing for jQuery 4 with WordPress 7.2](https://make.wordpress.org/core/2026/11/17/preparing-for-jquery-4-with-wordpress-7-2/)
- [WordPress and PHP 8.6](https://make.wordpress.org/core/2026/11/23/wordpress-and-php-8-6/)
- [Miscellaneous Developer Changes in WordPress 7.2](https://make.wordpress.org/core/2026/11/19/miscellaneous-developer-changes-in-wordpress-7-2/) and [Miscellaneous Editor Changes in WordPress 7.2](https://make.wordpress.org/core/2026/11/18/miscellaneous-editor-changes-in-wordpress-7-2/)
- [The Secrets API in WordPress 7.2](https://make.wordpress.org/core/2026/11/11/the-secrets-api-in-wordpress-7-2/) (includes the November 17 revert notice for `r65538`)

**Gutenberg and React 19**

- [What's new in Gutenberg 24.2](https://make.wordpress.org/core/2026/10/14/whats-new-in-gutenberg-24-2-14-october/), [24.3](https://make.wordpress.org/core/2026/11/02/whats-new-in-gutenberg-24-3-28-october/), and [24.4](https://make.wordpress.org/core/2026/11/13/whats-new-in-gutenberg-24-4-12-november/)
- [React 19 upgrade in WordPress](https://make.wordpress.org/core/2026/05/27/react-19-upgrade-in-wordpress/) and [React 19: punted beyond WordPress 7.1, experiment in Gutenberg](https://make.wordpress.org/core/2026/07/24/react-19-punted-beyond-wordpress-7-1-experiment-in-gutenberg/)

**Security**

- [The Hacker News: WordPress Blocks Six Backdoored WP Connect Plugins](https://thehackernews.com/2026/11/wordpress-blocks-six-backdoored-wp.html)
