import { Env } from "../types";
import { getDomainConfig } from "../services/config";
import { getRandomImage } from "../services/images";
import { getRandomQuote } from "../services/quotes";
import { generateHTML } from "../templates/base";

export async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const domain = url.hostname;

    const config = await getDomainConfig(env.CONFIG, domain);

    if (config.enabled === false) {
      return new Response("", { status: 204 });
    }

    const isGet = request.method === "GET";
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });

    if (isGet) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const [image, quote] = await Promise.all([
      getRandomImage(env.CONFIG, env.IMAGES),
      getRandomQuote(env.CONFIG),
    ]);

    const html = generateHTML(domain, image.base64, quote, config.style, image.credit, config.showQuotes);

    const response = new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
      },
    });

    if (isGet) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  } catch (error) {
    console.error("Error handling request:", error);
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Error</title></head>
<body><h1>Something went wrong</h1><p>Please try again later.</p></body>
</html>`;
    return new Response(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }
}
