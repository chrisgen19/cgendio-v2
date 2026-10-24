If you look after WordPress sites, the last three months were busy. Core shipped three security releases in ten weeks, two of them critical, and attackers were exploiting one of those bugs within days of it going public. WordPress 7.1 shipped in the same stretch, 7.2 got a roadmap, and the WP Engine lawsuit changed direction. This roundup is current to October 5, 2026. It links to the primary sources and ends with a checklist.

> **The short version.** Every site should be on **7.1.2**, or the newest security release on its branch (7.0.6, 6.9.9, 6.8.10 and so on, back to 4.7.37). Any site still on 6.9.0 to 6.9.4 or 7.0.0 to 7.0.1 has been open since July to an unauthenticated remote code execution bug that attackers are actively using.

## Three security releases in ten weeks

- **7.0.2 and 6.9.5, July 17.** Critical, and exploited in the wild: wp2shell, a pre-auth RCE through the REST batch endpoint and `WP_Query`.
- **7.1.1, September 17.** Eleven fixes, including Comment2Shell and Click2Shell, two chains that end in RCE.
- **7.1.2, September 22.** Critical (CVSS 9.2): path traversal in page template resolution, with conditional RCE.

The fixes in 7.1.1 and 7.1.2 were backported to every branch that still receives security updates, which currently goes back to 4.7. Sites with background updates on got them automatically. Sites where someone switched core updates off in `wp-config.php` didn't.

### wp2shell (July)

wp2shell chains two bugs. The first, [CVE-2026-63030](https://www.rapid7.com/blog/post/etr-cve-2026-63030-wp2shell-a-critical-remote-code-execution-vulnerability-in-wordpress-core/), is a logic flaw in the REST API batch processor at `/wp-json/batch/v1`. Validation and execution run in separate loops, so a sub-request whose path fails to parse throws the two arrays out of step, and every later request in the batch runs under the wrong handler. The second, CVE-2026-60137, is a SQL injection in the `author__not_in` parameter of `WP_Query`. Together they take an anonymous visitor to administrator and then to code execution, on a stock install with no plugins.

The full chain affected 6.9.0 to 6.9.4 and 7.0.0 to 7.0.1 (6.8 had the SQL injection but not the rest), and the fix shipped in 6.9.5 and 7.0.2 on July 17. CISA added both CVEs to its Known Exploited Vulnerabilities catalog on July 21. [CrowdSec](https://www.crowdsec.net/vulntracking-report/cve-2026-63030-wordpress-wp2shell-active-exploitation) logged the first exploitation attempts about 72 hours after disclosure, and in September it was still seeing 62,802 distinct attacking IPs.

If a site can't be updated straight away, block `/wp-json/batch/v1` and `?rest_route=/batch/v1` at the firewall. After patching, search the access logs for batch requests, and look for administrator accounts and plugins that nobody remembers adding.

### Comment2Shell and Click2Shell (7.1.1)

[7.1.1](https://wordpress.org/news/2026/09/wordpress-7-1-1-maintenance-and-security-release/) fixed eleven issues. Two of them were given names because they end in a shell:

- **Comment2Shell** (CVE-2026-93485, CVSS 7.1) is a stored XSS in `wpautop()`, the function that turns line breaks into paragraphs. An anonymous commenter puts a line break inside an HTML attribute, and after formatting, the attribute ends up as a live event handler. When a logged-in administrator opens the page, the script uses their session to upload a plugin that contains a web shell. Every version from 4.7 to 7.1.0 was affected. Rafie Muhammad reported it, and [The Hacker News](https://thehackernews.com/2026/09/wordpress-comment2shell-flaw-can-turn.html) found no sign of it being used in attacks.
- **Click2Shell** needs an administrator to open a crafted link. The link makes their browser install and preview a theme from the WordPress.org directory without anyone clicking Install, and a second bug in the chain turns that into code execution. Paulos Yibelo (pwn.ai) is credited with the theme install issue.

The other fixes cover path traversal in the REST templates controller, contributors overwriting arbitrary posts, XML-RPC publishing Customizer changesets past the `edit_css` check, and missing authorization checks that leaked private post titles and draft slugs.

### Page template path traversal (7.1.2)

Five days later, [7.1.2](https://wordpress.org/news/2026/09/wordpress-7-1-2-release/) fixed [CVE-2026-87902](https://github.com/WordPress/wordpress-develop/security/advisories/GHSA-7hp8-65ch-5whp): an unauthenticated attacker could make `get_page_template()` include a readable `.php` file from outside the theme directories. Getting from there to code execution needs two conditions, and the second is more common than it sounds:

1. The active theme or its parent has a top-level folder whose name starts with `page-`. The advisory names Twenty Twelve, Twenty Fourteen, Neve, Hestia and Sydney.
2. PEAR's `pearcmd.php` is on the include path and `register_argc_argv` is `On`. The advisory says that's the case in the official PHP Docker images and in cPanel setups running PHP older than 8.5.

The [Hacker News thread](https://news.ycombinator.com/item?id=49803959) on the advisory spent a lot of time on that second point, because plenty of WordPress sites run on exactly those images. Updating fixes the bug either way. These checks only tell you whether a site was exposed before it updated:

```bash title="check-cve-2026-87902.sh"
# Run from the WordPress root
wp core version

# Theme folders that start with page- (condition 1)
find wp-content/themes -mindepth 2 -maxdepth 2 -type d -name 'page-*'

# Condition 2. The CLI can read a different php.ini from PHP-FPM, so confirm with phpinfo() if unsure
php -r 'var_dump(ini_get("register_argc_argv"));'
php -r 'echo stream_resolve_include_path("pearcmd.php") ?: "pearcmd.php not on include_path", PHP_EOL;'
```

## A backdoor that rebuilds itself

On October 1, Sucuri researcher Gabriel Barbosa described [a backdoor](https://thehackernews.com/2026/10/wordpress-backdoor-rebuilds-itself.html) that "lives in at least eight places at once, spread across files, the database, and shared memory, and every one of those places can rebuild all the others." Delete the fake plugin and a drop-in writes it back. Delete the drop-in and the theme writes it back. It takes commands through the Ethereum blockchain, creates hidden administrator accounts and injects card-skimming JavaScript.

It hides in:

- `.user.ini`, using `auto_prepend_file` to run a loader before every PHP request
- `wp-content/c1b12371.php` and a hidden `wp-content/.c1b12371.php`
- `wp-content/db.php`, which holds the compressed payload, and `wp-content/advanced-cache.php`
- `wp-content/mu-plugins/hyper-engine-kit.php`
- A theme's `functions.php` (the sample used a theme called `khorshidi`)
- A System V shared memory segment, so a copy stays in RAM after the files are deleted

The cleanup has to remove every copy in one pass, including the cron entries and the shared memory, or it comes back. These commands give you leads, not proof. `db.php` and `advanced-cache.php` are legitimate drop-ins for tools like Query Monitor and page caching plugins, so compare them with what the site actually runs before you delete anything.

```bash title="find-persistence.sh"
# Run from the WordPress root
grep -rn "auto_prepend_file" --include=".user.ini" .
ls -la wp-content/ | grep -E "c1b12371|db\.php|advanced-cache\.php"
ls -la wp-content/mu-plugins/
wp core verify-checksums
wp plugin verify-checksums --all
wp user list --role=administrator --fields=ID,user_login,user_registered
wp cron event list --fields=hook,next_run_relative
ipcs -m   # shared memory segments; look for ones owned by the PHP user
```

## AI is finding WordPress bugs now

Adam Kues at Searchlight Cyber found wp2shell with GPT-5.6 in about ten hours and roughly $25 of usage. He [wrote](https://slcyber.io/research-center/exploit-brokers-pay-500000-for-a-wordpress-rce-i-found-one-with-gpt5-6/) that "no security researcher could have found and completed this exploit chain in 10 hours without AI", and expects security research to become "a bit higher-level", with researchers choosing targets and steering the model. Two of the eleven fixes in 7.1.1 are credited to Anthropic.

The [Hacker News discussion](https://news.ycombinator.com/item?id=48975665) of that write-up (over 400 points) split three ways:

- **Skeptics** pushed back on the headline: "Sure man, you found one with $25. With $25 plus your entire industry domain specific knowledge..."
- **Economists** expected the price of bugs to fall: "The market will quickly adjust to the point where spending $50 on tokens will on average give you a vulnerability valued at $50."
- **Critics of the codebase** focused on the bug class: "String concatenation SQL injection in the year 2026."

A widely shared post, [Where was Mythos when WordPress fell?](https://patrik.re/where-was-mythos-when-wordpress-fell/), asked why Anthropic's Mythos, which was promoted as a tool for securing open source, hadn't caught wp2shell first. It also argued that in practice, AI security research arrives "as a queue of tickets landing on unpaid volunteers." Both points can be true. The tools find real bugs, and people still have to triage them, fix them and backport the fixes to every branch back to 4.7. Three security releases in ten weeks suggests the pace has picked up.

## What 7.1 shipped

[WordPress 7.1 "Mary Lou"](https://make.wordpress.org/core/2026/08/05/wordpress-7-1-field-guide/) came out on August 19, during WordCamp US in Phoenix:

- Per-device responsive styling, plus hover and focus states for buttons
- A Tabs block and an audio Playlist block
- Notes attached to selected text instead of whole blocks, with rich-text formatting
- Image processing in the browser: compression, resizing, format conversion and thumbnails run on wasm-vips (libvips compiled to WebAssembly), with AVIF, HEIC and HDR gain map support
- More of the Abilities API that started in 6.9

For developers, the catch is in the media pipeline. [Client-side processing](https://make.wordpress.org/core/2026/07/22/client-side-media-processing-in-wordpress-7-1/) needs `SharedArrayBuffer`, which needs cross-origin isolation, and WordPress gets that from Document-Isolation-Policy. Only Chrome and Edge 137+ support it. Firefox and Safari quietly fall back to processing on the server. The isolated editor also breaks plugins that reach into same-origin iframes: [Elementor](https://github.com/elementor/elementor/issues/35975) and [SiteOrigin](https://github.com/siteorigin/siteorigin-panels/issues/1400) both have open issues. A site with a Content Security Policy needs `worker-src 'self' blob:` or the processing worker can't start. If a site depends on the old behaviour, switch it off:

```php title="functions.php"
// Process uploads on the server, as before 7.1
add_filter( 'wp_client_side_media_processing_enabled', '__return_false' );
```

A plugin called Client-Side Media Everywhere turns the feature on in Firefox and Safari by sending COOP and COEP headers. The trade-off is that `Cross-Origin-Opener-Policy: same-origin` cuts the link to cross-origin popups, so OAuth sign-in popups hang.

For context, [7.0 "Armstrong"](https://wordpress.org/news/2026/05/armstrong/) (May 20) put the AI Client, the Abilities API and a Connectors screen in core and refreshed the admin. The headline feature, real-time collaboration, was [pulled shortly before launch](https://www.infoq.com/news/2026/07/wordpress-7-ai/) over performance and server load concerns.

## What's planned for 7.2

[7.2](https://make.wordpress.org/core/2026/09/18/roadmap-to-7-2/) Beta 1 is due October 20-22, and the final release December 8-10, with Matt Mullenweg as release lead. The roadmap says outright that not everything on it will make the release.

- **Notes:** a suggestion mode where edits are accepted or rejected, plus emoji reactions
- **Security:** a sudo mode that asks for your password again before highly privileged actions (the roadmap only says "initial work is starting"), a Secrets API for storing credentials, and hardening for Application Passwords
- **Site Editor:** plugins can register their own screens and settings instead of building one-off admin pages
- **Blocks and styles:** a Description List block, a stable Table of Contents block, Global Styles for form elements, and a view of inherited styles
- **Admin:** SVG icons replacing Dashicons
- **Default theme:** Ipsum, a deliberately minimal blog theme
- **AI** stays in the separate AI plugin (more abilities, the MCP adapter, embeddings for semantic search), with no promise of moving into core
- **Real-time collaboration** is "intentionally not on the roadmap for 7.2"

Two items drew most of the discussion. The [Secrets API proposal](https://make.wordpress.org/core/2026/08/25/proposal-a-secrets-api-for-wordpress-7-2/) got mostly positive feedback, according to [The Repository](https://www.therepository.email/proposed-secrets-api-aims-to-bring-encrypted-credential-storage-to-wordpress-7-2). GravityKit's Zack Katz called it overdue, pointing at security plugins that rotate salts and break stored license keys. Ryan McCue of Altis posted "-1 on the overall proposal as is", arguing that a real security boundary means secrets are read-only from WordPress and managed by the host.

The other was the theme name. The release squad announcement on September 9 still called it Twenty Twenty-Seven. A week later [Ipsum](https://make.wordpress.org/core/2026/09/16/introducing-ipsum-the-new-default-theme/) replaced it, ending 16 years of year-based names. From now on a default theme gets its own name and changes when the design calls for it, not every year.

## The WP Engine case

In late September, Judge Araceli Martínez-Olguín made three calls in WP Engine v. Automattic, according to [WP More](https://wpmore.substack.com/p/issue-58) and [webhosting.today](https://webhosting.today/2026/09/29/automattic-is-not-an-owner-of-the-wordpress-marks-it-asserted-in-court-a-judge-rules/):

- **The antitrust claims are back.** She reversed her own 2025 dismissal and revived four counts: monopolization, attempted monopolization and two tying claims. One of the tying claims covers the WordPress.org login checkbox that asked users to confirm they weren't affiliated with WP Engine. The reversal followed an August 13 Ninth Circuit ruling in an unrelated surgical-robot repair case.
- **The extortion claim is gone for good.** The court found the 2024 licence fee demand "sought payment for something of real value."
- **Automattic doesn't own the WordPress marks.** The WordPress Foundation does, so Automattic and Mullenweg can't bring trademark counterclaims in their own right. Only the Foundation and WooCommerce can pursue those.

Summary judgment motions are due November 20, and a ten-day jury trial is set for October 19, 2027. Nothing changes for people building sites this week.

## Market share, and the people leaving

[W3Techs](https://w3techs.com/technologies/details/cm-wordpress) puts WordPress on 40.1% of all websites and 58.6% of sites with a known CMS (October 5, 2026). In June, [The Register](https://www.theregister.com/saas/2026/06/03/automattics-cms-empire-shows-cracks-as-wordpress-share-falls/5250420) called it the first sustained decline in years, down from 43.6% in June 2025. Its explanation was hosted builders like Wix, Shopify, Squarespace and Webflow gaining ground. It was careful to say there's no evidence people are leaving because of the WP Engine dispute. Upgrades are fast, though: version 7 already runs on 64.4% of the WordPress sites W3Techs sees.

Hacker News this year shows the mood. The most upvoted WordPress story was [someone buying 30 plugins and planting a backdoor in all of them](https://news.ycombinator.com/item?id=47755629) (April, nearly 1,200 points). Cloudflare's [EmDash](https://news.ycombinator.com/item?id=47602832), pitched as "a spiritual successor to WordPress that solves plugin security", drew over 500 comments. Posts like [Breaking up with WordPress after two decades](https://news.ycombinator.com/item?id=47997339) keep appearing. On the 7.1.2 thread, one commenter called WordPress "the single piece of software that has caused me the most problems over my 20 year IT career". Another replied with the usual defence: "If you're the most popular anything on the internet, you'll be the most attacked and the most exploited."

## Elsewhere

- **WordPress.com**'s [October 2 changelog](https://wordpress.com/blog/2026/10/02/changelog-growing-ai-toolbox/): its WordPress Agent can install, activate and update plugins from chat, the WordPress.com plugin is in Cursor's marketplace, Grok can connect to sites, and Personal and Premium plans now get PHP error and server logs.
- **Open Website Alliance:** Mary Hubbard became [president](https://wordpress.org/news/2026/09/owa-president/) on September 21, as the role rotates between WordPress, Drupal, Joomla and TYPO3. WordPress signed the Open Weights and American AI Leadership letter in August, and she wants the alliance to focus on AI.
- **Mullenweg's [homework from WordCamp](https://ma.tt/2026/08/homework-from-wordcamp/):** read how models are trained, watch the explainers, and run an open-weight model on your own machine, because "open weights mean the community can modify these models, the same way the GPL means you can modify WordPress."
- **For developers:** `block.json` has an `autoRegister` flag for PHP-only blocks, block variations can declare keyboard shortcuts, and Playground [supports WebMCP](https://developer.wordpress.org/news/2026/09/whats-new-for-developers-september-2026/) and can run versions back to 0.7.
- **WP Accessibility Day** runs 24 hours of talks on October 7-8.

## What to do this week

1. Run `wp core version` on every site and get each one onto 7.1.2, or the latest release on its branch.
2. Check `wp-config.php` for `WP_AUTO_UPDATE_CORE` set to `false` or `AUTOMATIC_UPDATER_DISABLED`. If minor updates are off, someone has to apply security releases by hand on the day they ship.
3. Run `wp core verify-checksums` and `wp plugin verify-checksums --all`, review administrator accounts, and go through the persistence checks above.
4. If you run WordPress on the official PHP Docker images (Coolify and Dokploy setups often do), copy `php.ini-production` into place so `register_argc_argv` is `Off`, and check whether `pearcmd.php` needs to be in the image at all.
5. On 7.1, test media uploads in Chrome on any site that uses a page builder. If uploads or the live editor break, use the filter above until the builder ships a fix.
6. Put 7.2 Beta 1 on a staging copy when it lands on October 20-22, especially sites with integrations that use Application Passwords.

## Sources

- WordPress.org: [7.1.1](https://wordpress.org/news/2026/09/wordpress-7-1-1-maintenance-and-security-release/), [7.1.2](https://wordpress.org/news/2026/09/wordpress-7-1-2-release/), [7.0 "Armstrong"](https://wordpress.org/news/2026/05/armstrong/), [Open Website Alliance](https://wordpress.org/news/2026/09/owa-president/)
- Make WordPress Core: [7.1 Field Guide](https://make.wordpress.org/core/2026/08/05/wordpress-7-1-field-guide/), [client-side media](https://make.wordpress.org/core/2026/07/22/client-side-media-processing-in-wordpress-7-1/), [7.2 release squad](https://make.wordpress.org/core/2026/09/09/announcing-the-wordpress-7-2-release-squad/), [Roadmap to 7.2](https://make.wordpress.org/core/2026/09/18/roadmap-to-7-2/), [Ipsum](https://make.wordpress.org/core/2026/09/16/introducing-ipsum-the-new-default-theme/), [Secrets API proposal](https://make.wordpress.org/core/2026/08/25/proposal-a-secrets-api-for-wordpress-7-2/)
- Advisories and research: [GHSA-7hp8-65ch-5whp](https://github.com/WordPress/wordpress-develop/security/advisories/GHSA-7hp8-65ch-5whp), [Rapid7 on wp2shell](https://www.rapid7.com/blog/post/etr-cve-2026-63030-wp2shell-a-critical-remote-code-execution-vulnerability-in-wordpress-core/), [CrowdSec](https://www.crowdsec.net/vulntracking-report/cve-2026-63030-wordpress-wp2shell-active-exploitation), [Searchlight Cyber](https://slcyber.io/research-center/exploit-brokers-pay-500000-for-a-wordpress-rce-i-found-one-with-gpt5-6/)
- News: [The Hacker News on Comment2Shell](https://thehackernews.com/2026/09/wordpress-comment2shell-flaw-can-turn.html), [The Hacker News on the Sucuri backdoor](https://thehackernews.com/2026/10/wordpress-backdoor-rebuilds-itself.html), [InfoQ on 7.0](https://www.infoq.com/news/2026/07/wordpress-7-ai/), [The Register on market share](https://www.theregister.com/saas/2026/06/03/automattics-cms-empire-shows-cracks-as-wordpress-share-falls/5250420), [The Repository on the Secrets API](https://www.therepository.email/proposed-secrets-api-aims-to-bring-encrypted-credential-storage-to-wordpress-7-2), [WP More #58](https://wpmore.substack.com/p/issue-58), [webhosting.today on the trademark ruling](https://webhosting.today/2026/09/29/automattic-is-not-an-owner-of-the-wordpress-marks-it-asserted-in-court-a-judge-rules/)
- Discussion: Hacker News on [GHSA-7hp8-65ch-5whp](https://news.ycombinator.com/item?id=49803959), [the GPT-5.6 write-up](https://news.ycombinator.com/item?id=48975665), [EmDash](https://news.ycombinator.com/item?id=47602832) and [the 30-plugin backdoor](https://news.ycombinator.com/item?id=47755629); [Where was Mythos when WordPress fell?](https://patrik.re/where-was-mythos-when-wordpress-fell/)
