import { Config } from ".";
import { type ApplicationConfig } from "@/config";

/**
 * `AllConfigurations` is a type that maps all keys of `ApplicationConfig`
 * to their respective values associated with the `value` property.
 */
export type AllConfigurations = {
    [K in keyof ApplicationConfig]: ApplicationConfig[K]['value'];
};

/**
 * `ConfigurationKeys` is a type that represents all the keys of `ApplicationConfig`.
 */
export type ConfigurationKeys = keyof ApplicationConfig;

/**
 * `ConfigurationValue<Key>` is a generic type that takes a key from `ApplicationConfig`
 * and returns the type of the value associated with the `value` property for that key.
 * 
 * @template Key - A valid key from `ApplicationConfig`.
 */
export type ConfigurationValue<Key extends ConfigurationKeys> = ApplicationConfig[Key]['value'];

/**
 * `ConfigController` is a type representing the `Config` module, ensuring it matches
 * the type of the value exported from `Config`.
 */
export type ConfigController = typeof Config;

/**
 * Global declaration to add `Config` and `__Configurations` as globally accessible properties
 * throughout the application.
 */
declare global {
    /**
     * The global `Config` object, typed as `ConfigController`.
     * It may contain functions or application-related settings.
     */
    var Config: ConfigController;

    /**
     * `__Configurations` is a global object that stores the application's configuration,
     * typed as `ApplicationConfig`.
     */
    var __Configurations: ApplicationConfig;

    interface globalThis {
        /**
         * The `Config` object within the globalThis scope, following the structure of `ConfigController`.
         */
        Config: ConfigController;

        /**
         * The global configuration object `__Configurations` within `globalThis`,
         * which follows the `ApplicationConfig` type.
         */
        __Configurations: ApplicationConfig;
    }
}
