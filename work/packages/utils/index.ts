import { exec, type ExecOptions } from 'node:child_process'
import { existsSync, watch } from 'node:fs'
import { join } from 'node:path'
import crypto from 'crypto'

export function AESencrypt(value: string, key: string): string {
  if (key.length !== 32) throw new Error('Key must be 32 bytes long for AES-256-CBC.')

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv)

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final()
  ])

  return `${iv.toString('base64')}:${encrypted.toString('base64')}`
}

/**
 * Decrypt value AES
 */
export function AESdecrypt(encrypted: string, key: string): string {
  if (key.length !== 32) throw new Error('Key must be 32 bytes long for AES-256-CBC.')

  const [ivBase64, encryptedBase64] = encrypted.split(':')
  if (!ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted value format.')
  }

  const iv = Buffer.from(ivBase64, 'base64')
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64')

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv)

  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final()
  ])

  return decrypted.toString('utf8')
}

/**
 * This constant provides the path of the main module that started the Node.js process.
 * It's useful for determining the root directory of the project.
 */
export const rootDIR = import.meta.dirname!

/**
 * Current mode of source, Javascript or Typescript
 */
export const modeSRC = import.meta.filename!.endsWith('ts')
  ? 'Typescript'
  : 'Javascript'

/**
 * Try callback value, case catch error set def(default)
 * @param callback
 * @param def
 * @returns
 */
export function trySet<Datable>(
  callback: () => Datable,
  def: Datable,
): Datable {
  try {
    return callback()
  } catch {
    return def
  }
}

/**
 * Generate randow string
 */
export function generate(length: number = 32, ext = false): string {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  if (ext) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?/`~'

  const randomBytes = crypto.randomBytes(length)
  const randomString = Array.from(randomBytes)
    .map(byte => chars[byte % chars.length])
    .join('')

  return randomString
}


/**
 * Executes a shell command synchronously and writes the output to the Deno stdout.
 *
 * @param {string} cmd - The command to be executed.
 * @returns {ChildProcess} The spawned child process.
 *
 * @example
 * executeSync("ls -la");
 */
export function executeSync(cmd: string) {
  const _process = exec(cmd)

  if (_process && _process.stdout) {
    _process.stdout.on('data', (data) => {
      process.stdout.write(data.toString())
    })
  }

  if (_process && _process.stderr) {
    _process.stderr.on('data', (data) => {
      process.stdout.write(data.toString())
    })
  }

  return process
}

/**
 * Executes a shell command asynchronously and writes the output to the Deno stdout.
 *
 * @param {string} cmd - The command to be executed.
 * @param {ExecOptions} [options] - Optional options to configure the execution.
 * @returns {Promise<void>} A promise that resolves when the command completes.
 *
 * @example
 * execute("ls -la")
 *   .then(() => console.log("Command executed successfully!"))
 *   .catch(err => console.error(`Failed to execute command: ${err.message}`));
 */
export function execute(cmd: string, options?: ExecOptions): Promise<void> {
  return new Promise((resolve) => {
    const _process = exec(cmd, options)

    if (_process && _process.stdout) {
      _process.stdout.on('data', (data) => {
        process.stdout.write(data.toString())
      })
    }

    if (_process && _process.stderr) {
      _process.stderr.on('data', (data) => {
        process.stdout.write(data.toString())
      })
    }

    _process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        console.error(`Process exited with code ${code}`)
        resolve()
      }
    })

    _process.on('error', (err) => {
      console.error(`Child Error: ${err.message}`)
      resolve()
    })
  })
}

/**
 * Extending fs watch to something more useful
 */
export function watcher(
  path: string,
  callback: (
      event: 'delete' | 'edit' | 'create',
      filepath: string,
   ) => Promise<void>,
  timeout_ = 700,
) {
  const watched_files: Record<string, string> = {}
  watch(path, { recursive: true }, async function (_, filename) {
    let timeout: Timer | null = null
    if (!timeout) {
      if (filename) await loadfiles(join(path, filename))
      timeout = setTimeout(function () {
        timeout = null
      }, timeout_)
    }
  })
  async function loadfiles(locale: string) {
    //load event "delete"
    if (!existsSync(locale) && watched_files[locale]) {
      delete watched_files[locale]
      await callback('delete', locale)
    }
    // load event "create"
    else if (existsSync(locale) && !watched_files[locale]) {
      await callback('create', locale)
      watched_files[locale] = locale
    }
    // load event "edit"
    else {
      await callback('edit', locale)
    }
  }
}
