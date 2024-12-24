/**
 * Select used plugins in elysia, up to down
 */
export default [
   (await import ("./session")).default,
   (await import ("./strategy")).default,
] as const;