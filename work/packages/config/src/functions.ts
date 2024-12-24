import type { ConfigurationSchema, SupportedTypeds } from './types'
 

export function AddConfig<Key extends string, Typed extends string>(key: Key, conf = {} as { type?: Typed } & Partial<ConfigurationSchema<Typed extends keyof SupportedTypeds ? Typed : 'string', Key>>) {
  const config = {
    ...conf,
    type: conf.type ? conf.type : 'string',
    key,
    ...(conf.prop ? { prop: conf.prop as Key } : { prop: key }),
    ...(conf.default ? { default: conf.default } : { default: undefined as unknown as SupportedTypeds[Typed extends keyof SupportedTypeds ? Typed : 'string'] }),
  }

  //@ts-expect-error ignore
  return config as readonly typeof config & { type: Typed extends keyof SupportedTypeds ? Typed : 'string', default: SupportedTypeds[Typed] }
}


export const AddSchema = <T extends readonly unknown[]>(...args: T): T => args

/**
 * Config Error
 */
export class ConfigError extends Error { };