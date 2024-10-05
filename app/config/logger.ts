import { ConfigType, Configuration } from "@/controllers/config";
import { LoggingsLevel } from "@loggings/beta/dist/types/libs/types";

export const LoggerConf = {
  /**
   * Level of register/show logger
   */
  log_level: new Configuration<LoggingsLevel>({
    env: "LOG_LEVEL",
    type: ConfigType.String,
    def: "info",
    chk(_value, def) {
      const value = _value.toLocaleLowerCase();
      if (["debug", "info", "warn", "error"].includes(value)) {
        return value as LoggingsLevel;
      }
      return def;
    },
  }),
};
