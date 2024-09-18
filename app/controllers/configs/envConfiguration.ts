import { trySet } from "@/helpers";
import env from "@/libs/env";
import { Loggings } from "@loggings/beta";

enum Config {
    String = "Str",
    Number = "Int",
    Boolean = "Bool",
}

interface Constructor<Schematic> {
    type: Config;
    env: string;
    save?: boolean;
    chk?(value: string, def: Schematic): Schematic;
    def: Schematic;
}

export class EnvConfiguration<Schematic> {
    public readonly type: Config;
    public static readonly type = Config;
    public readonly env: string;
    public readonly save: boolean;
    public value: Schematic;
    public readonly chk?: (value: string, def: Schematic) => Schematic;
    public readonly def: Schematic;
    constructor(opts: Constructor<Schematic>) {
        this.type = opts.type;
        this.env = opts.env;
        this.def = opts.def;
        this.chk = opts.chk;
        this.value = opts.def;
        this.save = typeof opts.save !== "boolean" ? false : opts.save;
    }

    public update(value: Schematic, nosave = false) {
        if (!nosave) env.save(this.env, JSON.stringify(value));
        this.value = value;
    }

    public static config() {
        const envs = env.envall();
        for (const _key in global.__Configurations) {
            const key = _key as keyof typeof global.__Configurations;
            const config = global.__Configurations[key];
            
            if (envs[config.env] == (typeof config.value !== "string" ? JSON.stringify(config.value) : config.value)) continue;
            if (envs[config.env]) {
                let value;
                if (config.chk) {
                    value = config.chk(envs[config.env], config.def as never);
                } else if (config.type === Config.String) {
                    value = envs[config.env];
                } else {
                    value = trySet(
                        () => JSON.parse(envs[config.env]),
                        config.def as never,
                    );
                }
                global.__Configurations[key].update(value as never);
                console.debug(`[${config.env}].blue-b - Changed`);
                if (_key.startsWith("log")) {
                    // update loggings conf
                    Loggings.config({
                        ...Loggings.getDefaults(),
                        [_key.slice(4)]: value,
                    });
                }
            }
        }
    }
}