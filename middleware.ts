/**
 * Next.js middleware entry point.
 *
 * Next.js requires a file named `middleware.ts` at the project root that
 * exports a function named `middleware` (and optionally `config`).
 *
 * The actual implementation lives in `proxy.ts` so it can be unit-tested
 * independently — this file simply wires it into the Next.js runtime.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export { proxy as middleware, config } from './proxy';
