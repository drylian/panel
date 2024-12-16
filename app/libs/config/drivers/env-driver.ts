import { env } from "../formats/env";
import { ConfigError } from "../functions";
import { ConfigDriver } from "../driver";

export const EnvDriver = new ConfigDriver({
   async: false,
   config: {
      filepath: ".env"
   },
   supported_types: ["array", "boolean", "number", "string"],
   save(instance) {
      let newdata: Record<string, any> = {};
      let comments: Record<string, string> = {};
      Object.entries(instance.cache).forEach(([key, value]) => {
         if (instance.conf(key).default !== value) {
            if (instance.conf(key).description) comments[instance.conf(key).prop.toUpperCase()] = instance.conf(key).description!;
            newdata[instance.conf(key).prop.toUpperCase()] = value;
         }
      })
      env.update(newdata, comments, instance.config.filepath);
   },
   set(key, newvalue, instance) {
      const conf = instance.conf(key);
      if (conf.check) {
         //@ts-ignore diff type
         instance.cache[key] = conf.check({...conf, instance }, instance.cache[key], newvalue);
      } else {
         instance.cache[key] = newvalue;
      }
      instance.driver.save(instance);
      return instance.cache[key]
   },
   get(conf, instance) {
      if (!instance.cache[conf.key] && instance.conf(conf.key).default) instance.cache[conf.key] = instance.conf(conf.key).default;
      return instance.cache[conf.key];
   },
   del(conf, instance) {
      //@ts-ignore diffed type
      instance.cache[conf.key] = undefined;
      if (instance.conf(conf.key).default) instance.cache[conf.key] = instance.conf(conf.key).default;
      instance.driver.save(instance);
      return true;
   },
   has(conf, instance) {
      return instance.cache[conf.key] ? true : false;
   },
   init(instance) {
      const pathfile = instance.driver.config.filepath;
      const initial = env.read(undefined, pathfile);
      if (instance.schemas) {
         for (const key in instance.schemas) {
            const schema = instance.conf(key);
            if (!instance.driver.supported_types.includes(schema.type)) throw new ConfigError(`[EnvDriver]: Schema "${schema.key}" not is supported type`);
            if (initial[instance.conf(key).prop.toUpperCase()]) {
               if (schema.check) {
                  instance.cache[key] = schema.check({...schema, instance }, schema.default, initial[instance.conf(key).prop.toUpperCase()]);
               } else {
                  instance.cache[key] = initial[instance.conf(key).prop.toUpperCase()];
               }
            } else {
               if (schema.default && !instance.cache[key] && !schema.check) instance.cache[key] = schema.default;
               if (schema.check) instance.cache[key] = schema.check({...schema, instance }, undefined, schema.default);
            }
         }
      } else {
         for (const key in initial) {
            // not use schematic, is generic
            instance.cache[key] = initial[key];
         }
      }
   }
})