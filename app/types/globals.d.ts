import { i18n as i18lang } from "@/controllers/i18n";

declare global {
  var i18n: typeof i18lang;
  var __: typeof i18lang.live.trans;
  interface globalThis {
    /**
     * Language
     */
    i18n: typeof i18lang;
    /**
     * Translator direct
     */
    __: typeof i18lang.live.trans;
  }
}
