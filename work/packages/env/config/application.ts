import { AddConfig } from '@panel/config'
import { env } from '@panel/config'
import { generate } from '@panel/utils'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

export default [
  AddConfig('app.mode', {
    default: 'development',
    prop: 'NODE_ENV',
    description: 'Node application Mode',
    check(conf, oldvalue, newvalue) {
      const valid = ['development', 'production']
      const current = oldvalue ? oldvalue : newvalue ? newvalue : conf.default

      if (valid.includes(current)) {
        return process.env.NODE_ENV = current
      }
      return conf.default
    },
  }),

  AddConfig('app.lang', {
    default: 'en_US',
    prop: 'APP_LANGUAGE',
    description: 'Application Language',
  }),

  AddConfig('app.port', {
    default: 3000,
    type: 'number',
    prop: 'APP_PORT',
    description: 'Application Port',
  } as const),

  AddConfig('app.key', {
    default: generate(),
    prop: 'APP_KEY',
    check(conf) {
      let value = env.read('APP_KEY')
      if (!value) value = env.save('APP_KEY', conf.default)
      return value
    },
    description: 'Application Crypt Key',
  }),

  AddConfig('app.url', {
    default: 'localhost',
    prop: 'APP_URL',
    description: 'Application Url',
  }),

  AddConfig('app.name', {
    prop: 'APP_NAME',
    default: 'NextPanel',
    description: 'Application Name',
  }),

  AddConfig('app.level', {
    default: 'Info',
    prop: 'APP_LOG_LEVEL',
    description: 'Logging register/show level ["Debug", "Info", "Warn", "Error"]',
    check(conf, oldvalue, newvalue) {
      if (!oldvalue && !newvalue) return conf.default
      if (!newvalue) return oldvalue!
      const value = newvalue.toLocaleLowerCase()
      const level = value.charAt(0).toUpperCase() + value.slice(1)

      if (['Debug', 'Info', 'Warn', 'Error'].includes(level)) {
        return level
      }
      return oldvalue ? oldvalue : conf.default
    },
  }),

  AddConfig('app.storage', {
    default: './storage',
    prop: 'APP_STORAGE',
    description: 'Application Root Storage',
    check(conf, oldvalue, newvalue) {
      const current = newvalue ? newvalue : oldvalue ? oldvalue : conf.default
      if (!existsSync(current)) mkdirSync(current, { recursive: true })
      return current
    },
  }),

  AddConfig('app.register_locale_file', {
    prop: 'APP_LOG_REGISTER_DIR',
    default: '/logs',
    description: 'Loggings dir of logs based in storage {storage}/logs',
    check(conf, oldvalue, newvalue) {
      const _current = newvalue ? newvalue : oldvalue ? oldvalue : conf.default

      const pathdir = path.join(conf.instance.get('app.storage'))
      const current = _current.includes(pathdir) ? _current : path.join(pathdir, _current)

      if (!existsSync(current)) mkdirSync(current, { recursive: true })

      return current
    },
  }),

  AddConfig('app.register_filename', {
    prop: 'APP_LOG_REGISTER_FILE',
    default: '{year}-{month}-{day}.{ext}',
    description: 'Logging filename format',
    check(conf, oldvalue, newvalue) {
      const current = newvalue ? newvalue : oldvalue ? oldvalue : conf.default
      return current
    },
  }),
] as const