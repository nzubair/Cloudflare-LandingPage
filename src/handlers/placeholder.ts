import { Env } from "../types";
import { getDomainConfig } from "../services/config";
import { getRandomImage } from "../services/images";
import { getRandomQuote } from "../services/quotes";
import { generateHTML } from "../templates/base";

export async function handleRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const domain = url.hostname;

  const [config, imageBase64, quote] = await Promise.all([
    getDomainConfig(env.CONFIG, domain),
    getRandomImage(env.CONFIG, env.IMAGES),
    getRandomQuote(env.CONFIG),
  ]);

  const html = generateHTML(domain, imageBase64, quote, config.style);

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
