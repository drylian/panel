import { Loggings } from "@loggings/beta";
import env from "./env-lib";

export enum ConfigType {
  String,
  Number,
  Boolean,
}

interface Constructor<Schematic> {
  type: ConfigType;
  env: string;
  save?: boolean;
  chk?(value: string, def: Schematic): Schematic;
  def: Schematic;
}

export class Configuration<Schematic> {
  public readonly type: ConfigType;
  public static readonly type = ConfigType;
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

  public static config(nolog = true) {
    const envs = env.envall();
    for (const _key in global.__Configurations) {
      const key = _key as keyof typeof global.__Configurations;
      const config = global.__Configurations[key];

      if (
        envs[config.env] ==
        (typeof config.value !== "string"
          ? JSON.stringify((config as { value: string }).value)
          : config.value)
      )
        continue;
      if (envs[config.env]) {
        let value;
        if (config.chk) {
          value = config.chk(envs[config.env], config.def as never);
        } else if (config.type === ConfigType.String) {
          value = envs[config.env];
        } else {
          value = trySet(
            () => JSON.parse(envs[config.env]),
            config.def as never,
          );
        }
        global.__Configurations[key].update(value as never);
        if (!nolog) console.debug(__("config_changed", { config: config.env }));
        if (_key.startsWith("log")) {
          // update loggings conf
          Loggings.config({
            [_key.slice(4)]: value,
          });
        }
      }
    }
  }
}

/**
 * Try callback value, case catch error set def(default)
 * @param callback
 * @param def
 * @returns
 */
function trySet<Datable>(callback: () => Datable, def: Datable): Datable {
  try {
    return callback();
  } catch {
    return def;
  }
}
