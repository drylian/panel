/**
 * Based by package "ini"
 */
type EncodeOptions = {
  section?: string;
  align?: boolean;
  newline?: boolean;
  sort?: boolean;
  whitespace?: boolean;
  platform?: string;
  bracketedArray?: boolean;
};

const encode = (obj: Record<string, any>, options: EncodeOptions | string = {}): string => {
  const opt: EncodeOptions = typeof options === "string" ? { section: options } : options;

  opt.align = !!opt.align;
  opt.newline = !!opt.newline;
  opt.sort = !!opt.sort;
  opt.whitespace = !!opt.whitespace || !!opt.align;
  opt.platform = opt.platform || (typeof process !== "undefined" && process.platform) || "linux";
  opt.bracketedArray = opt.bracketedArray !== false;

  const eol = opt.platform === "win32" ? "\r\n" : "\n";
  const separator = opt.whitespace ? " = " : "=";
  const children: string[] = [];
  const keys = opt.sort ? Object.keys(obj).sort() : Object.keys(obj);

  let padToChars = 0;

  if (opt.align) {
    padToChars = Math.max(
      ...keys
        .filter((key) => obj[key] === null || Array.isArray(obj[key]) || typeof obj[key] !== "object")
        .map((key) => safe(Array.isArray(obj[key]) ? `${key}[]` : key).length)
    );
  }

  let result = "";
  const arraySuffix = opt.bracketedArray ? "[]" : "";

  for (const key of keys) {
    const value = obj[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        result += `${safe(`${key}${arraySuffix}`).padEnd(padToChars)}${separator}${safe(item)}${eol}`;
      }
    } else if (value && typeof value === "object") {
      children.push(key);
    } else {
      result += `${safe(key).padEnd(padToChars)}${separator}${safe(value)}${eol}`;
    }
  }

  if (opt.section && result.length) {
    result = `[${safe(opt.section)}]${opt.newline ? eol + eol : eol}${result}`;
  }

  for (const child of children) {
    const sectionName = `${opt.section ? `${opt.section}.` : ""}${splitSections(child, ".").join("\\.")}`;
    const childContent = encode(obj[child], { ...opt, section: sectionName });
    if (result && childContent) result += eol;
    result += childContent;
  }

  return result;
};

const encodeWithComment = (
  obj: Record<string, { value: any; comment?: string }>,
  options: EncodeOptions | string = {}
): string => {
  const opt: EncodeOptions = typeof options === "string" ? { section: options } : options;

  opt.align = !!opt.align;
  opt.newline = !!opt.newline;
  opt.sort = !!opt.sort;
  opt.whitespace = !!opt.whitespace || !!opt.align;
  opt.platform = opt.platform || (typeof process !== "undefined" && process.platform) || "linux";
  opt.bracketedArray = opt.bracketedArray !== false;

  const eol = opt.platform === "win32" ? "\r\n" : "\n";
  const separator = opt.whitespace ? " = " : "=";
  const children: string[] = [];
  const keys = opt.sort ? Object.keys(obj).sort() : Object.keys(obj);

  let padToChars = 0;

  if (opt.align) {
    padToChars = Math.max(
      ...keys
        .filter((key) => obj[key] === null || Array.isArray(obj[key]) || typeof obj[key] !== "object")
        .map((key) => safe(Array.isArray(obj[key]) ? `${key}[]` : key).length)
    );
  }

  let result = "";
  const arraySuffix = opt.bracketedArray ? "[]" : "";

  for (const key of keys) {
    const entry = obj[key];

    if (Array.isArray(entry.value)) {
      for (const item of entry.value) {
        if (entry.comment) {
          result += `; ${entry.comment}${eol}`;
        }
        result += `${safe(`${key}${arraySuffix}`).padEnd(padToChars)}${separator}${safe(item)}${eol}`;
      }
    } else if (entry.value && typeof entry.value === "object") {
      children.push(key);
    } else {
      if (entry.comment) {
        result += `; ${entry.comment}${eol}`;
      }
      result += `${safe(key).padEnd(padToChars)}${separator}${safe(entry.value)}${eol}`;
    }
  }

  if (opt.section && result.length) {
    result = `[${safe(opt.section)}]${opt.newline ? eol + eol : eol}${result}`;
  }

  for (const child of children) {
    const sectionName = `${opt.section ? `${opt.section}.` : ""}${splitSections(child, ".").join("\\.")}`;
    if (obj[child].comment) {
      result += `${eol}; ${obj[child].comment}`;
    }
    const childContent = encode(obj[child].value ? obj[child].value : obj[child], { ...opt, section: sectionName });
    if (result && childContent) result += eol;
    result += childContent;
  }

  return result;
};

const splitSections = (str: string, separator: string): string[] => {
  const sections: string[] = [];
  let lastSeparatorIndex = 0;
  let nextIndex = 0;

  while ((nextIndex = str.indexOf(separator, lastSeparatorIndex)) !== -1) {
    if (str[nextIndex - 1] === "\\") {
      lastSeparatorIndex = nextIndex + 1;
      continue;
    }
    sections.push(str.slice(lastSeparatorIndex, nextIndex));
    lastSeparatorIndex = nextIndex + separator.length;
  }

  sections.push(str.slice(lastSeparatorIndex));
  return sections;
};

const isQuoted = (value: string): boolean =>
  (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));

const safe = (value: unknown): string => {
  if (typeof value !== "string" || /[=\r\n]/.test(value) || /^\[/.test(value) || value.trim() !== value || isQuoted(value)) {
    return JSON.stringify(value);
  }
  return value.replace(/;/g, "\\;").replace(/#/g, "\\#");
};

const unsafe = (value: string): string => {
  let unescaped = "";
  let escaped = false;

  for (const char of value.trim()) {
    if (escaped) {
      unescaped += char;
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (";#".includes(char)) {
      break;
    } else {
      unescaped += char;
    }
  }

  return unescaped.trim();
};

const decode = (str: string, options: EncodeOptions = {}): Record<string, any> => {
   const opt = { bracketedArray: true, ...options };
   const out: Record<string, any> = {};
   let currentSection: Record<string, any> = out;
   let sectionName: string | null = null;
 
   const lines = str.split(/[\r\n]+/);
   const sectionRegex = /^\[([^\]]+)]\s*$/;
   const keyValueRegex = /^([^=]+)(=(.*))?$/;
 
   for (const line of lines) {
     if (!line || line.match(/^\s*[;#]/)) continue;
 
     const sectionMatch = sectionRegex.exec(line);
     if (sectionMatch) {
       sectionName = unsafe(sectionMatch[1]);
       if (sectionName === "__proto__") continue;
 
       currentSection = sectionName.split(".").reduce((acc, key) => {
         if (!acc[key]) acc[key] = {};
         return acc[key];
       }, out);
       continue;
     }
 
     const keyValueMatch = keyValueRegex.exec(line);
     if (!keyValueMatch) continue;
 
     const rawKey = unsafe(keyValueMatch[1]);
     const isArray = opt.bracketedArray && rawKey.endsWith("[]");
     const key = isArray ? rawKey.slice(0, -2) : rawKey;
 
     if (key === "__proto__") continue;
 
     const rawValue = keyValueMatch[3] ? unsafe(keyValueMatch[3]) : true;
     const value = rawValue === "true" || rawValue === "false" || rawValue === "null" ? JSON.parse(rawValue) : rawValue;
 
     const target = key.split(".").reduce((acc, keyPart, idx, arr) => {
       if (!acc[keyPart]) acc[keyPart] = {};
       if (idx === arr.length - 1) return acc;
       return acc[keyPart];
     }, currentSection);
 
     if (isArray) {
       if (!Array.isArray(target[key])) target[key] = [];
       target[key].push(value);
     } else {
       target[key] = value;
     }
   }
 
   return out;
 };
 

const ini =  { encode, encodeWithComment, decode, safe, unsafe };
export {
   encode, encodeWithComment, decode, safe, unsafe, ini
};
export default ini;

