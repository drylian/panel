import { ClientEvents } from "discord.js"

export abstract class EventListener<Instance extends string> {
   constructor(
      public readonly key: keyof ClientEvents extends keyof ClientEvents ? Instance :never,
      public readonly once?: boolean,
   ) {
   }

   public abstract on(...params: ClientEvents[Instance extends { key: keyof ClientEvents } ? Instance["key"] : never]): Promise<void> | void

   public off(...params: ClientEvents[Instance extends { key: keyof ClientEvents } ? Instance["key"] : never]): Promise<void> | void { }
}

@EventListener
class sla extends EventListener {
   constructor() {
      super("applicationCommandPermissionsUpdate")
   }
}
sla.prototype.key
const event = useEvent("autoModerationRuleCreate", )