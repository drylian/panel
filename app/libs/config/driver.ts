import type { DriverConfiguration } from "./types";

export class ConfigDriver<IsAsync, ExtendConfig, TypedDriver extends DriverConfiguration<IsAsync extends boolean ? IsAsync : boolean, ExtendConfig>> {
   public readonly async: IsAsync;
   public config: TypedDriver['config'];
   public readonly set: TypedDriver['set'];
   public readonly get: TypedDriver['get'];
   public readonly del: TypedDriver['del'];
   public readonly has: TypedDriver['has'];

   public readonly init: TypedDriver['init'];
   public readonly save: TypedDriver['save'];
   public readonly supported_types: TypedDriver['supported_types'];

   constructor(driver: TypedDriver & { async: IsAsync, config:ExtendConfig }) {
      this.async = driver.async;
      this.config = driver.config;
      this.set = driver.set;
      this.get = driver.get;
      this.has = driver.has;
      this.del = driver.del;
      this.init = driver.init;
      this.save = driver.save;
      this.supported_types = driver.supported_types;
   }
}