export const DEFAULT_LANGUAGE = "en_US";

export class i18n {
  public static core = new Map<string, Record<string, object>>();
  public static live = new i18n();
  public current = global.Config.get("lang") ?? DEFAULT_LANGUAGE;

  public sl(new_lang: string) {
    const lang = i18n.core.get(new_lang);
    if (lang) {
      this.current = new_lang;
      return true;
    } else return false;
  }

  public trans(
    key: string,
    params: Record<string, string | number> = {},
    log = true,
    iso_key?: string,
  ): string {
    if (!params.lang) params.lang = this.current;
    if (params.namespace) key = `${params.namespace}.${key}`;
    if (params.ns) key = `${params.ns}.${key}`;
    const keys = key.replaceAll(":", ".").split(".");
    const lang = i18n.core.get(this.current);
    if (!lang && log) {
      console.warn(
        `Language ${this.current} not found, using default ${global.Config.get("lang") ?? DEFAULT_LANGUAGE} and trying again...`,
      );
      this.current = global.Config.get("lang") ?? DEFAULT_LANGUAGE;
      const tes = this.trans(key, params, false);
      return tes;
    } else if (!lang && !log) {
      return key;
    }
    let translation = keys.reduce(
      (acc: any, key: string) => {
        return acc && acc[key] !== undefined ? acc[key] : null;
      },
      iso_key ? lang![iso_key]! : lang,
    );

    if (typeof translation === "string" && Object.keys(params).length) {
      for (const param in params) {
        translation = translation.replaceAll(
          `{${param}}`,
          this.trans(String(params[param]), {}, false),
        );
      }
    }
    if (!translation) translation = keys.join(".");
    return translation;
  }
}
