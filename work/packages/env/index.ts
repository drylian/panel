export * from './config/index'
import Environment from './config/index'

/**
 * Allow env in global modules
 */
declare global {
   const Env: typeof Environment

   interface globalThis {
     Env: typeof Environment;
   }
 }