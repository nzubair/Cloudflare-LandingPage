import { Env } from "../types";
import { getDomainConfig } from "../services/config";
import { getRandomImage } from "../services/images";
import { getRandomQuote } from "../services/quotes";
import { generateHTML } from "../templates/base";

export async function handleRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const domain = url.hostname;

    const [config, imageBase64, quote] = await Promise.all([
      getDomainConfig(env.CONFIG, domain),
      getRandomImage(env.CONFIG, env.IMAGES),
      getRandomQuote(env.CONFIG),
    ]);

    const html = generateHTML(domain, imageBase64, quote, config.style);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
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
