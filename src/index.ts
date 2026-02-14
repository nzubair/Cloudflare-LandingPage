import { Env } from "./types";
import { handleRequest } from "./handlers/placeholder";

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    return handleRequest(request, env);
  },
};
