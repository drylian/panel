import type Elysia from "elysia";

export type ElysiaPlugin = typeof import("@/http/plugins").default;

/**
 * Get elysia with selected plugins
 */
export type ElysiaWithPlugins<T extends readonly ((app: Elysia) => any)[]> =
  T extends readonly [infer First, ...infer Rest]
    ? First extends (app: Elysia) => infer R
      ? Rest extends readonly ((app: Elysia) => any)[]
        ? ElysiaWithPlugins<Rest> & R
        : R
      : never
    : Elysia;
/**
 * Elysia instance typed with plugins
 */
export type IElysia = ElysiaWithPlugins<ElysiaPlugin>;
/**
 * Context of Elysia
 */
export type ElysiaContext =  Parameters<Parameters<IElysia['derive']>[1]>[0];
