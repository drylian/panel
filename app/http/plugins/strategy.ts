import StrategiesConfig from "@/http/strategies";
import type { Elysia } from "elysia";

const tuple = <T extends readonly any[]>(...args: T): T => args;

const Strategies = tuple(...StrategiesConfig);
type StrategyTypes = MappedByKey<"type", typeof Strategies>;

export default function (app: Elysia) {
   return app.derive((ctx) => {
      let data: any = undefined;
      let type: string = "guest";
      for (const strategy of Strategies) {
         // case strategy data is defined
         if (typeof data !== "undefined") continue;
         //@ts-expect-error ctx is required
         if (!strategy.check(ctx)) continue;
         try {
            //@ts-expect-error ctx is required
            data = strategy.authenticate(ctx);
            type = strategy.type;
         } catch (e) {
            //@ts-expect-error ctx is required
            if (strategy.error) strategy.error(e as Error, ctx);
            data = undefined;
            type = "guest"
         }
      };
      return {
         strategies: {
            type,
            data
         },
         auth<Key extends keyof StrategyTypes>(_auth: Key): (Awaited<ReturnType<StrategyTypes[Key]['authenticate']>> | undefined) {
            return type == _auth ? data : undefined;
         }
      }
   })
}
