import { AddConfig } from '@panel/config'

export default [
  /**
    * Session cookie name, used for signing session cookies
    */
  AddConfig('session.cookie', {
    prop:'SESSION_COOKIE',
    default:'_nextpanel_session',
    description:'Session cookie name, used for signing session cookies',
  }),

  /**
    * Session Expiration
    * Session expires time default is 15 minutes
    */
  AddConfig('session.expire', {
    type:'number',
    prop:'SESSION_EXPIRE',
    default: 15 * 60 * 1000,
    description:'Session expires time default is 15 minutes.',
  } as const),
]