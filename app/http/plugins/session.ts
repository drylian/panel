import { randomUUIDv7 } from "bun";
import type { Elysia } from "elysia";

type SessionOptions = {
   expire: number,
   value: Record<string, any>
}

export const Sessions = new Map<string, SessionOptions>();

/**
 * Clear expired sessions
 */
setInterval(() => {
   Sessions.forEach((session, key) => {
      const expired = session.expire < Date.now();
      if (expired) Sessions.delete(key);
   })
}, 1000);

export default function SessionPlugin(app: Elysia) {
   return app.derive((ctx) => {
      const sid = ctx.cookie[Env.get("session.cookie")];

      // delete expirated sessions
      Sessions.forEach((session, key) => {
         const expired = session.expire < Date.now();
         if (expired) Sessions.delete(key);
      })

      const reference = sid?.value || randomUUIDv7("hex", Date.now());

      Sessions.set(reference, { expire: Date.now() + Env.get("session.expire"), value: {} });
      ctx.cookie[Env.get("session.cookie")].value = reference;
      return {
         session: Sessions.get(reference)!.value,
         sessionId: reference,
         destroySession: () => {
            Sessions.delete(reference);
            //@ts-ignore ignore
            ctx.session = {};
            ctx.cookie[Env.get("session.cookie")].remove();
         }
      }
   }).onAfterResponse(ctx => {
      if (Sessions.get(ctx.sessionId)) {
         const newexpire = Date.now() + Env.get("session.expire");
         Sessions.set(ctx.sessionId, {
            expire: newexpire,
            value: ctx.session
         });
      }
   })
}
