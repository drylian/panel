import { AddSchema, Configuration, EnvDriver } from "@/libs/config";
import { DatabaseEnvConf } from "./database";
import { ApplicationEnvConf } from "./application";

const Env = new Configuration({
   driver: EnvDriver,
   schema: AddSchema(
      ...ApplicationEnvConf,
      ...DatabaseEnvConf,
   )
})

Env.init();

//@ts-ignore ignore;
global.Env = Env;

export { type Env };