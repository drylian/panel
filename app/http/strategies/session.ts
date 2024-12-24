import { Strategy } from "@/controllers/http/strategy";
import { Sessions } from "../plugins/session";

/**
 * Session Strategy
 */
export default new Strategy({
   type:"session",
   check(ctx) {
      const cookie = ctx.cookie[Env.get("session.cookie")];
      if(cookie.value) {
         return Sessions.has(cookie.value);
      }
      ctx
      return false;
   },
   async authenticate(ctx) {
      const user = ctx.auth("session")!
   }
})