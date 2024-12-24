import type { ConfigDriver } from './driver'
import type { AddSchema } from './functions'
import type { ConfigurationSchema, DriverConfiguration, MappedByKey, SupportedTypeds } from './types'
/* eslint-disable @typescript-eslint/no-explicit-any */

export class Configuration<ExtendedDriverConfig, TypedDriver extends DriverConfiguration<boolean, ExtendedDriverConfig>, SchematedConf extends ReturnType<typeof AddSchema<ConfigurationSchema<any,any>[]>>> {
  public driver: ConfigDriver<boolean, ExtendedDriverConfig, TypedDriver>
  public readonly schemas: MappedByKey<'key', ReturnType<typeof AddSchema<SchematedConf>>>
  public readonly async: TypedDriver['async']
  constructor(readonly schematic: { driver: ConfigDriver<boolean, ExtendedDriverConfig, TypedDriver>, schema: ReturnType<typeof AddSchema<SchematedConf>>}) {
    this.driver = schematic.driver
    this.async = schematic.driver.async
    this.schemas = Object.assign({}, ...schematic.schema.map(schema => {
      return {
        [schema.key]: schema
      }
    }))
  }

  public cache = {} as { [K in keyof MappedByKey<'key',SchematedConf>]: SupportedTypeds[MappedByKey<'key',SchematedConf>[K]['type']] }

  public get config() {
    return this.driver.config
  }

  public set config(update) {
    this.driver.config = update
  }

  public conf<Key extends keyof MappedByKey<'key',SchematedConf>>(key: Key) {
    return this.schemas[key]
  }

  public get<Key extends keyof MappedByKey<'key',SchematedConf>>(key: Key): typeof this.async extends true
      ? Promise<SupportedTypeds[typeof this.schemas[Key]['type']]>
      : SupportedTypeds[typeof this.schemas[Key]['type']] {
    const result = this.driver.get(this.schemas[key], this as any)
    //@ts-expect-error unknown type, ignored
    return result
  }

  public set<Key extends keyof MappedByKey<'key',SchematedConf>>(key: Key, newvalue: MappedByKey<'key',SchematedConf>[Key]['default']): typeof this.async extends true
      ? Promise<SupportedTypeds[typeof this.schemas[Key]['type']]>
      : SupportedTypeds[typeof this.schemas[Key]['type']] {
    const result = this.driver.set(key as string, newvalue, this as any)
    //@ts-expect-error unknown type, ignored
    return result
  }

  public keys(): keyof MappedByKey<'key',SchematedConf>[] {
    //@ts-expect-error unknown type, ignored
    return Object.keys(this.schemas)
  }

  public has<Key extends keyof MappedByKey<'key',SchematedConf>>(key: Key): typeof this.async extends true
      ? Promise<boolean>
      : boolean {
    //@ts-expect-error unknown type, ignored
    return this.driver.has(this.conf(key), this as any)
  }

  public del<Key extends keyof MappedByKey<'key',SchematedConf>>(key: Key): typeof this.async extends true
      ? Promise<boolean>
      : boolean {
    //@ts-expect-error unknown type, ignored
    return this.driver.del(this.schemas[key], this as any)
  }

  public save(): typeof this.async extends true
      ? Promise<void>
      : void {
    //@ts-expect-error unknown type, ignored
    return this.driver.save(this as any)
  }

  public init(): typeof this.async extends true
      ? Promise<void>
      : void {
    //@ts-expect-error unknown type, ignored
    return this.driver.init(this as any)
  }
}