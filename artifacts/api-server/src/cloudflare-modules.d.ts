/** Virtual modules resolved by Wrangler at bundle time (avoid @cloudflare/workers-types → duplicate drizzle-orm). */
declare module "cloudflare:node" {
  export function httpServerHandler(options: { port: number }): {
    fetch(
      request: Request,
      env: unknown,
      ctx: { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void },
    ): Response | Promise<Response>;
  };
}
