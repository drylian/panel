import { Configuration, EnvDriver } from "@/libs/config";

const Env = new Configuration({
   driver: EnvDriver,
   schema: [
      ...(await import("./application")).default,
      ...(await import("./database")).default,
      ...(await import("./session")).default,
   ]
})

Env.init();

//@ts-ignore ignore;
global.Env = Env;

export { type Env };