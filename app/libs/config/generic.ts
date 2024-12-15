import type { ConfigDriver } from "./driver";
import type { ConfigurationSchema, SupportedTypeds, DriverConfiguration } from "./types";

/**
 * Version not typed of Configuration, made generic configurations based in typed value
 */
export class GenericConfiguration<ExtendedDriverConfig, TypedDriver extends DriverConfiguration<boolean, ExtendedDriverConfig>> {
   public driver: ConfigDriver<boolean, ExtendedDriverConfig, TypedDriver>;
   public readonly async: TypedDriver['async'];
   public cache = {} as Record<string,any>;
   constructor(driver: ConfigDriver<boolean, ExtendedDriverConfig, TypedDriver>) {
      this.driver = driver;
      this.async = driver.async;
   }

   public get config() {
      return this.driver.config;
   }

   public set config(update) {
      this.driver.config = update;
   }

   public conf(key: string) {
      const conf = {} as ConfigurationSchema<keyof SupportedTypeds, string>;
      const value = this.cache[key];

      switch(typeof value) {
         case "bigint":
         case "number": {
            conf.type = "number";
            break;
         }
         case "string": {
            conf.type = "string";
            break;
         }
         case "boolean": {
            conf.type = "boolean";
            break;
         }
         default: {
            if(Array.isArray(value)) {
               conf.type = "array";
            } else if(typeof value === "object") {
               if (Buffer.isBuffer(value)) {
                  conf.type = "buffer";
               } else {
                  conf.type = "object";
               }
            }
         }
      }
      return {
         ...conf,
         type: conf.type,
         key,
         prop: key,
         default: undefined,
         check:undefined
      }
   
   }

   public get<Typed>(key: string): typeof this.async extends true
      ? Promise<Typed | undefined>
      : (Typed | undefined) {
      const result = this.driver.get(this.conf(key) as any, this as any);
      // @ts-ignore unknown type, ignored
      return result;
   }

   public set<Typed>(key: string, newvalue: unknown): typeof this.async extends true
      ? Promise<Typed>
      : Typed {
      const result = this.driver.set(key as string, newvalue as any, this as any);
      // @ts-ignore unknown type, ignored
      return result;
   }

   public keys(): string[] {
      // @ts-ignore unknown type, ignored
      return Object.keys(this.cache);
   }

   public has(key: string): typeof this.async extends true
      ? Promise<boolean>
      : boolean {
      // @ts-ignore unknown type, ignored
      return this.driver.has(this as any);
   }

   public del(key: string): typeof this.async extends true
      ? Promise<boolean>
      : boolean {
      // @ts-ignore unknown type, ignored
      return this.driver.del(this.conf(key), this as any);
   }

   public save(): typeof this.async extends true
      ? Promise<void>
      : void {
      // @ts-ignore unknown type, ignored
      return this.driver.save(this as any);
   }

   public init(): typeof this.async extends true
      ? Promise<void>
      : void {
      // @ts-ignore unknown type, ignored
      return this.driver.init(this as any);
   }
}