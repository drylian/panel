import { Paths, ValueOfConfig } from "@/types/config";
import { EnvConfiguration } from "./configs/EnvConfiguration";

/**
 * Class responsible for managing global configurations.
 */
export class Config {
    /**
     * Retrieves the value of a specific configuration based on the provided path.
     * 
     * @template P - Path to the configuration within `Configurations`.
     * @param {P} path - The path to the desired configuration key.
     * @returns {ValueOfConfig<typeof Configurations, P>["value"]} - The value associated with the configuration key.
     */
    public static get<P extends Paths<typeof global.__Configurations>>(
        path: P,
    ): ValueOfConfig<typeof global.__Configurations, P>["value"] {
        const data = global.__Configurations[path];
        return data["value"];
    }

    /**
     * Updates the value of a specific configuration based on the provided path.
     * 
     * @template P - Path to the configuration within `Configurations`.
     * @param {P} path - The path to the desired configuration key.
     * @param {ValueOfConfig<typeof Configurations, P>["value"]} value - The new value to be set for the configuration.
     * @returns {ValueOfConfig<typeof Configurations, P>["value"]} - The updated value of the configuration.
     */
    public static set<P extends Paths<typeof global.__Configurations>>(
        path: P,
        value: ValueOfConfig<typeof global.__Configurations, P>["value"],
    ) {
        const data = global.__Configurations[path];
        data.update(value as never, !data.save);
        return data["value"];
    }

    /**
     * Reloads the environment configurations, applying any updates.
     * 
     * This method is used to reinitialize configurations based on environment variables.
     */
    public static reload() {
        EnvConfiguration.config();
    }
}
