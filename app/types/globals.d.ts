import { i18n as i18lang } from "@/controllers/i18n";
import { Env as Environment } from "@/env";
import type { Context as ElysiaContext } from "elysia/context";
import Users from "@/models/users";
import { SessionMap, SessionOptions } from "@/http/middlewares/session";
declare global {
  var i18n: typeof i18lang;
  var __: typeof i18lang.live.trans;
  const Env: typeof Environment;

  /**
   * Returns type of parameters of function
   */
  type ArgumentTypes<F extends readonly Function> = F extends (...args: infer A) => any ? readonly A : never;

  /**
   * Returns type of parameters of constructor
   */
  type ConstructorArgumentTypes<F extends readonly Function> = F extends (...args: infer A) => any ? readonly A : never;

  /**
   * Convert Array in object type based in the key
   */
  type MappedByKey<KL extends string, T extends readonly { [KV in KL]: string }[]> = {
    [K in T[number][KL]]: Extract<T[number], { [KV in KL]: K }>;
  };

  interface globalThis {
    /**
     * Language
     */
    i18n: typeof i18lang;
    /**
     * Translator direct
     */
    __: typeof i18lang.live.trans;
    Env: typeof Environment;
  }
}