import { i18n as i18lang } from "@/controllers/i18n";
import { Env as Environment } from "@/env";
declare global {
  var i18n: typeof i18lang;
  var __: typeof i18lang.live.trans;
  const Env: typeof Environment;

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
