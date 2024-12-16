import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import ini from "../formats/ini";
import path from "path";
import { ConfigError } from "../functions";
import { ConfigDriver } from "../driver";

export function TryorDef<T>(cb: (() => T), def: T): T {
   try {
      return cb();
   } catch {
      return def;
   }
}

export const IniDriver = new ConfigDriver({
   async: false,
   config: {
      filepath: "app.ini"
   },
   supported_types: ["array", "boolean", "number", "object", "string"],
   save(instance) {
      let newdata: Record<string, { value: any, comment?: string }> = {};
      Object.entries(instance.cache).forEach(([key, value]) => {
         if (instance.conf(key).description) {
            newdata[instance.schemas[key].prop] = {
               value,
               comment: instance.conf(key).description
            }
         } else {
            newdata[instance.schemas[key].prop] = {
               value
            };
         }
      })
      writeFileSync(instance.driver.config.filepath, ini.encodeWithComment(newdata));
   },
   set(key, newvalue, instance) {
      const conf = instance.conf(key);
      if (conf.check) {
         //@ts-ignore ignore
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
      if (!pathfile.endsWith(".ini")) throw new ConfigError("[IniDriver]: Pathfile must not end with .ini");

      const initial = TryorDef(() => {
         if (!existsSync(pathfile)) return {};
         const content = readFileSync(pathfile, "utf-8");
         return ini.decode(content);
      }, {});

      if (!existsSync(pathfile)) {
         const dirpath = path.dirname(pathfile);
         if (dirpath !== ".") mkdirSync(dirpath);
         writeFileSync(pathfile, "");
      }

      if (instance.schemas) {
         for (const key in instance.schemas) {
            const schema = instance.conf(key);
            if (!instance.driver.supported_types.includes(schema.type)) throw new ConfigError(`[InvDriver]: Schema "${schema.key}" not is supported type`);
            if (initial[key.toUpperCase()]) {
               if (schema.check) {
                  instance.cache[key] = schema.check({...schema, instance }, instance.cache[key], initial[key.toUpperCase()]);
               } else {
                  instance.cache[key] = initial[key];
               }
            }
            if (schema.default && !instance.cache[key]) instance.cache[key] = schema.default;
         }
      } else {
         for (const key in initial) {
            // not use schematic, is generic
            instance.cache[key] = initial[key];
         }
      }
   }
})