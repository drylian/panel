import { AddSchema, Configuration, EnvDriver } from '@panel/config'

const Env = new Configuration({
  driver: EnvDriver,
  schema: AddSchema(
    ...(await import('./application')).default,
    ...(await import('./database')).default,
    ...(await import('./session')).default,
  )
})

//@ts-expect-error ignore
global.Env = Env

export default Env