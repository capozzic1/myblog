# Chris  — Personal Blog

Angular 20 standalone components, TypeScript, and SCSS. No added runtime dependencies.

## Run locally

```sh
npm install
npm start
```

Open http://localhost:4200. On PowerShell systems that block npm.ps1, use `npm.cmd`.

```sh
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Production output: `dist/personal-blog/browser`. Configure static hosting to serve `index.html` for unknown routes so article deep links work.

## Structure

- `src/app/home.*`: responsive home layout and signal-based search.
- `src/app/components/`: reusable header, hero, post card, About sidebar, and footer.
- `src/app/data/blog-post.ts`: readonly presentation model.
- `src/app/data/posts.service.ts`: typed WordPress HTTP requests and response mapping.
- `src/app/post-page.ts`: lazy-loaded article view with missing-post handling.
- `src/styles.scss`: shared colors, typography, layout container, and accessibility styles.

Posts load from `https://public-api.wordpress.com/wp/v2/sites/dreamcapsite.wordpress.com/posts`, with `_embed=1` for featured media and category names. The home page fetches 10 posts at a time, newest first, with a Load more button; search filters the posts loaded so far. Article deep links fetch by slug independently of the list. Loading, retry, empty, and missing-post states are handled. Public posts require no credentials.

WordPress titles and excerpts become plain text, with HTML entities decoded and the excerpt’s Read more link removed. Article HTML uses Angular’s standard `[innerHTML]` sanitization, preserving paragraphs, links, lists, and inline images without bypassing security.

Images prefer embedded featured media, then Jetpack’s featured URL, then the first article image. The legacy URL `https://i0.wp.com/localhost/images/autumn-road.png` maps to the existing `/images/autumn-road.png` asset, including inside article HTML. This is a specific compatibility mapping; new images should be uploaded to the WordPress Media Library to get publicly accessible URLs. Featured images already present in the article are not duplicated above it. Posts without an image use the cycling hero as a fallback.

## Assets

All images and the Inter variable font are served locally. The original screenshot supplied layout guidance; generated photography approximates its imagery. The About image is an illustrative avatar, not a photograph of Chris.

- `public/images/cycling-sunset.png`: generated hero photograph.
- `public/images/autumn-road.png`: generated autumn road photograph.
- `public/images/about.png`: generated illustrative avatar.
- `public/images/gym.jpg`: Unsplash photo `1534438327276-14e5300c3a48`.
- `public/images/development.jpg`: Unsplash photo `1498050108023-c5249f4df085`.
- `public/fonts/InterVariable.woff2`: Inter by Rasmus Andersson; license in `public/fonts/OFL.txt`.

Generated with the built-in image generation tool, using these final prompts:

**Hero:** Use case: photorealistic-natural. Asset type: wide personal blog hero background photograph, aspect ratio 3:1. A black road bicycle with drop handlebars leaning beside a rough stone wall at a mountain overlook at sunset, bicycle on rightmost quarter of composition. Layered dark blue mountain ridges, orange sunset with sun near right third, dusky blue and muted pink sky. Left half open landscape dark enough for white headline overlay. Natural editorial photography. No text, typography, graphics, UI, watermark or logos. Save generated image to project asset when possible.

**Road:** Use case: photorealistic-natural. Asset type: personal blog thumbnail photo, landscape 2:1. A gently curving paved road with yellow center line through a dense forest of golden autumn trees, warm late afternoon light, green and orange foliage, quiet reflective mood. No people, no text, no logos. Natural photography.

**Avatar:** Use case: photorealistic-natural. Asset type: square personal blog avatar photograph. A single anonymous adult man viewed from behind, dark jacket and small backpack, standing at mountain overlook watching orange sunset, layered dark blue hills, dark silhouette head centered in frame, upper body portrait. Minimal quiet outdoors editorial photo. No text or logos.
