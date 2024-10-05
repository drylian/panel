export * from "./configuration";
export * from "./env-lib";
export type * from "./types";
import { Configuration } from ".";
import type {
  ConfigurationValue,
  ConfigurationKeys,
  AllConfigurations,
} from "./types";

/**
 * Class responsible for managing global configurations.
 */
export class Config {
  /**
   * Retrieves the value of a specific configuration based on the provided Config.
   *
   */
  public static get<Key extends ConfigurationKeys>(
    Config: Key,
  ): ConfigurationValue<Key> {
    if (!global.__Configurations)
      return undefined as unknown as ConfigurationValue<Key>;
    const data = global.__Configurations[Config];
    if (!data) return undefined as (typeof data)["value"];
    return data["value"] as ConfigurationValue<Key>;
  }

  /**
   * Updates the value of a specific configuration based on the provided Config.
   *
   */
  public static set<Key extends ConfigurationKeys>(
    Config: Key,
    value: ConfigurationValue<Key>,
  ) {
    const data = global.__Configurations[Config];
    data.update(value as never, false);
    return data["value"];
  }

  public static all(): AllConfigurations {
    const data: Record<string, unknown> = {};
    for (const key in global.__Configurations) {
      const configuration = global.__Configurations[key as ConfigurationKeys];
      data[key] = configuration["value"];
    }
    return data as AllConfigurations;
  }

  /**
   * Load Application Configuration
   * @param conf Application Configuration
   */
  public static useConfig(conf: any) {
    global.__Configurations = conf;
    global.Config = Config;
    global.Config.reload(true);
  }

  /**
   * Reloads the environment configurations, applying any updates.
   *
   * This method is used to reinitialize configurations based on environment variables.
   */
  public static reload(nolog = false) {
    Configuration.config(nolog);
  }
}
