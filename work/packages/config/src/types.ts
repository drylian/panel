import type { Configuration } from './config'
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Supported configuration types for the application.
 */
export type SupportedTypeds = {
   'string': string;
   'number': number;
   'boolean': boolean;
   'array': Array<any>;
   'object': object;
   'arraybuffer': ArrayBuffer;
   'buffer': Buffer;
}


/**
 * Structure of a single configuration entry.
 * 
 * @template Typed - The type of the configuration value.
 */
export interface ConfigurationSchema<Typed extends keyof SupportedTypeds, Key extends string> {
   /** The type of the configuration value. */
   type: Typed;

   /** An optional property name associated with this configuration. */
   prop: string;

   /** The key identifier for this configuration. */
   key: Key;

   /** An optional description for this configuration. */
   description?: string;

   /** The default value for this configuration. */
   default: SupportedTypeds[Typed];

   /**
    * A validation or transformation function for the configuration value.
    * 
    * @param conf - The current configuration metadata.
    * @param oldvalue - The previously set value, if any.
    * @param newvalue - The new value to be set, if provided.
    * @returns The validated or transformed configuration value.
    */
   check?: (
      conf: ConfigurationSchema<Typed, Key> & { instance: Configuration<any, DriverConfiguration<false, any>, ConfigurationSchema<any, any>[]> },
      oldvalue: SupportedTypeds[Typed] | undefined,
      newvalue?: SupportedTypeds[Typed] | undefined,
   ) => SupportedTypeds[Typed];
}

export type MappedByKey<KL extends string, T extends readonly { [KV in KL]: string }[]> = {
   [K in T[number][KL]]: Extract<T[number], { [KV in KL]: K }>;
};

/**
 * Base structure for configuration drivers.
 * 
 * @template IsAsync - Indicates whether the driver supports asynchronous operations.
 */
export interface DriverConfiguration<IsAsync extends boolean, ExtendConfig> {
   /** Indicates if the driver supports asynchronous operations. */
   async: IsAsync;

   /** Extends Configurations */
   config: ExtendConfig;

   /** The list of supported configuration types by the driver. */
   supported_types: (keyof SupportedTypeds)[];

   set: IsAsync extends true
   ? (
      key: string,
      newvalue: SupportedTypeds[keyof SupportedTypeds],
      instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>
   ) => Promise<SupportedTypeds[keyof SupportedTypeds]>
   : (
      key: string,
      newvalue: SupportedTypeds[keyof SupportedTypeds],
      instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>
   ) => SupportedTypeds[keyof SupportedTypeds];

   get: IsAsync extends true
   ? (conf: ConfigurationSchema<keyof SupportedTypeds, any>, instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>) => Promise<SupportedTypeds[keyof SupportedTypeds]>
   : (conf: ConfigurationSchema<keyof SupportedTypeds, any>, instance: Configuration<ExtendConfig, DriverConfiguration<false, ExtendConfig>, ConfigurationSchema<any, any>[]>) => SupportedTypeds[keyof SupportedTypeds];

   save: IsAsync extends true
   ? (instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>) => Promise<void>
   : (instance: Configuration<ExtendConfig, DriverConfiguration<false, ExtendConfig>, ConfigurationSchema<any, any>[]>) => void;

   del: IsAsync extends true
   ? (conf: ConfigurationSchema<keyof SupportedTypeds, any>, instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>) => Promise<boolean>
   : (conf: ConfigurationSchema<keyof SupportedTypeds, any>, instance: Configuration<ExtendConfig, DriverConfiguration<false, ExtendConfig>, ConfigurationSchema<any, any>[]>) => boolean;

   has: IsAsync extends true
   ? (conf: ConfigurationSchema<keyof SupportedTypeds, any>, instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>) => Promise<boolean>
   : (conf: ConfigurationSchema<keyof SupportedTypeds, any>, instance: Configuration<ExtendConfig, DriverConfiguration<false, ExtendConfig>, ConfigurationSchema<any, any>[]>) => boolean;

   init: IsAsync extends true
   ? (instance: Configuration<ExtendConfig, DriverConfiguration<true, ExtendConfig>, ConfigurationSchema<any, any>[]>) => Promise<void>
   : (instance: Configuration<ExtendConfig, DriverConfiguration<false, ExtendConfig>, ConfigurationSchema<any, any>[]>) => void;
}