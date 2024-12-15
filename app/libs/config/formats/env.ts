/**
 * Reworked Env by drylian
 */
import fs from "node:fs";

const LINE =
   /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

function parse<Datable extends Record<string, any>>(src: string): Datable extends object ? Datable : Record<string, any> {
   const obj = {} as Record<string, any>;
   let lines = src.toString();
   lines = lines.replace(/\r\n?/g, "\n");

   let match;
   while ((match = LINE.exec(lines)) !== null) {
      const key = match[1];
      const rawValue = match[2] || match[3] || match[4] || match[5] || "";

      let value = rawValue.trim();

      try {
         if (value.startsWith("[") && value.endsWith("]")) {
            // Parse JSON-style arrays
            obj[key] = JSON.parse(value);
         } else if (value === "null") {
            obj[key] = null;
         } else if (value === "undefined") {
            obj[key] = undefined;
         } else if (/^(true|false)$/i.test(value)) {
            // Boolean
            obj[key] = value.toLowerCase() === "true";
         } else if (/^\d+$/.test(value)) {
            // Integer
            obj[key] = parseInt(value);
         } else if (/^\d*\.\d+$/.test(value)) {
            // Float
            obj[key] = parseFloat(value);
         } else if (value.startsWith("\"") && value.endsWith("\"")) {
            // String with double quotes
            obj[key] = value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\r/g, "\r");
         } else {
            value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
            obj[key] = value;
         }
      } catch (error) {
         console.error(`Error parsing value for key "${key}":`, error);
      }
   }

   //@ts-ignore
   return obj;
}


function save(key: string, value: any, comment?: string, path = "./.env") {
   try {
      if (!fs.existsSync(path)) fs.writeFileSync(path, "", "utf8");

      let envFileContent = fs.readFileSync(path, "utf8");
      const envConfig = parse(envFileContent);

      let formattedValue: string;

      if (Array.isArray(value)) {
         formattedValue = JSON.stringify(value);
      } else if (!value) {
         formattedValue = String(value);
      } else {
         formattedValue = value.toString();
      }

      if (envConfig[key]) {
         envFileContent = envFileContent.replace(
            new RegExp(`^${key}=.+$`, "m"),
            `${key}=${formattedValue}`
         );
      } else if (Object.keys(envConfig).includes(key) && (formattedValue == "null" || formattedValue == "undefined")) {
         envFileContent = envFileContent.replace(
            new RegExp(`^${key}=.+$`, "m"),
            `${key}=${formattedValue}`
         );
      } else {
         envFileContent += `${comment ? `# ${comment}\n` : "\n"
            }${key}=${formattedValue}`;
      }

      fs.writeFileSync(path, envFileContent, "utf8");
      return value;
   } catch (error) {
      console.error("Error updating environment variable:", error);
      throw error;
   }
}

function update(
   envObject: Record<string, any>,
   comments: Record<string,string>,
   path = "./.env"
) {
   try {
      if (!fs.existsSync(path)) {
         fs.writeFileSync(path, "", "utf8");
      }

      let envFileContent = fs.readFileSync(path, "utf8");
      const envConfig = parse(envFileContent);

      for (const [key, value] of Object.entries(envObject)) {
         let formattedValue: string;

         if (Array.isArray(value)) {
            formattedValue = JSON.stringify(value);
         } else if (!value) {
            formattedValue = String(value);
         } else {
            formattedValue = value.toString();
         }

         if (envConfig[key]) {
            envFileContent = envFileContent.replace(
               new RegExp(`^${key}=.+$`, "m"),
               `${key}=${formattedValue}`
            );
         } else if (Object.keys(envConfig).includes(key) && (formattedValue == "null" || formattedValue == "undefined")) {
            envFileContent = envFileContent.replace(
               new RegExp(`^${key}=.+$`, "m"),
               `${key}=${formattedValue}`
            );
         } else {
            envFileContent += `${comments[key] ? `# ${comments[key]}\n` : ""}${key}=${formattedValue}\n`;
         }
      }

      fs.writeFileSync(path, envFileContent, "utf8");
   } catch (error) {
      console.error("Error updating environment file:", error);
      throw error;
   }
}


function read<T extends any = any>(key?: string, path = "./.env"):T {
   if (!fs.existsSync(path)) {
      fs.writeFileSync(path, "", "utf8");
   }

   const envFileContent = fs.readFileSync(path, "utf8");
   const envConfig = parse(envFileContent);

   return key ? envConfig[key] : envConfig;
}

const env = { parse, read, save, update };
export { parse, read, save, update, env };
export default env;