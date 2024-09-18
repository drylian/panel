import { Colors, console_defaults, Formatter, Fragmenter, Loggings, LoggingsColors, LoggingsPluginData, Timer } from "@loggings/beta";
import { inspect } from "util";
export const DEFAULT_LANGUAGE = "en_US";

export class Language {
    public static core = new Map<string, Record<string, object>>();
    public static live = new Language();
    public current = Language.getLanguage();

    public static getLanguage() {
        return global.Config ? global.Config.get("lang") ? global.Config.get("lang") ? Language.core.get(global.Config.get("lang")) ? global.Config.get("lang") : DEFAULT_LANGUAGE : DEFAULT_LANGUAGE : DEFAULT_LANGUAGE : DEFAULT_LANGUAGE;
    }

    public trans(key: string, params: Record<string, string | number> = {}, log = true, iso_key?: string): string {
        if (!params.lang) params.lang = this.current;
        const keys = key.replaceAll(":", ".").split(".");
        const lang = Language.core.get(this.current);

        if (!lang && log) {
            console.warn(`Language ${this.current} not found, using default ${Language.getLanguage()} and trying again...`);
            this.current = Language.getLanguage();
            const tes = this.trans(key, params, false)
            return tes;
        } else if (!lang && !log) {
            return key;
        }
        let translation = keys.reduce((acc: any, key: string) => {
            return acc && acc[key] !== undefined ? acc[key] : null;
        }, iso_key ? lang![iso_key]! : lang);

        if (typeof translation === "string" && Object.keys(params).length) {
            for (const param in params) {
                translation = translation.replaceAll(
                    `<${param}>`,
                    this.trans(String(params[param]), {}, false),
                );
            }
        }
        if (!translation) translation = keys.join(".");
        return translation
    }
}

export const LoggingsTranslatorPlugin: LoggingsPluginData<
    typeof console_defaults
> = {
    identify: "TranslatorConsolePlugin",
    defaults: console_defaults,
    onMessage(configs, level, args) {
        // load level in console
        configs.level = configs.console_level
            ? configs.console_level
            : configs.level;

        let message_csl =
            Formatter(configs.format)[configs.disable_colors ? 1 : 0];
        message_csl = Timer(message_csl).format;

        let message = "";

        message = args.map((arg) => {
            return typeof arg == "string" ? arg : inspect(arg, {
                depth: null,
                colors: !configs.disable_colors,
            });
        }).join(" ");
        const no_fragmented = message;
        const fragment = Fragmenter(no_fragmented);
        const translation_frags: Record<string, string> = {};

        fragment.frags.forEach((frag) => {
            if (Object.hasOwn(LoggingsColors, frag.key)) {
                fragment.text = fragment.text.replaceAll(
                    `<${frag.key}>`,
                    `${frag.value}`,
                );
            } else {
                translation_frags[frag.key] = frag.value;
            }
        });

        message = Language.live.trans(
            fragment.text,
            translation_frags,
            false,
            "console"
        );

        if(fragment.text === message) message = no_fragmented;

        const loggings_fragment = Fragmenter(message, "{{*}}");

        loggings_fragment.frags.forEach((frag) => {
            let fragmented = frag.value;
            if (frag.bold) {
                fragmented = Colors("bold", fragmented);
            }
            fragmented = Colors(
                frag.key as keyof typeof LoggingsColors,
                fragmented,
            );
            loggings_fragment.text = loggings_fragment.text.replace(
                `{{${frag.key}}}`,
                fragmented,
            );
        });

        message = loggings_fragment.text;

        message_csl = message_csl.replace(
            /{message}/g,
            message,
        );

        message_csl = message_csl.replace(
            /{title}/g,
            configs.disable_colors
                ? configs.title
                : Colors(configs.color, configs.title),
        );

        message_csl = message_csl.replace(
            /{status}/g,
            configs.disable_colors
                ? level
                : Colors(configs.status[level], level),
        );

        (["info", "debug"].includes(level.toLowerCase())
            ? process.stdout
            : process.stderr).write(message_csl + "\n");

    }
}