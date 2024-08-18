import fs from "node:fs";

// Regex of env
const LINE =
    /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

/**
 * DotEnv Parse
 * @param src E
 * @returns
 */
function parse(src: string) {
    const obj = {} as Record<string, string>;
    let lines = src.toString();
    lines = lines.replace(/\r\n?/mg, "\n");

    let match;
    while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
            value = value.replace(/\\n/g, "\n");
            value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
    }
    return obj;
}

function save(key: string, value: string, comment?: string, path = "./.env") {
    try {
        if (!fs.existsSync(path)) fs.writeFileSync(path, "", "utf8");
        let envFileContent = fs.readFileSync(path, "utf8");
        const envConfig = parse(envFileContent);
        if (envConfig[key]) {
            envFileContent = envFileContent.replace(
                new RegExp(`${key}=.+$`, "m"),
                `${key}=${value}`,
            );
        } else {
            envFileContent += `\n${
                comment ? `# ${comment}\n` : ""
            }${key}=${value}`;
        }
        fs.writeFileSync(path, envFileContent);
        return value;
    } catch (error) {
        console.error("Error updating environment variable:", error);
        throw error;
    }
}

function read(key: string, path = "./.env") {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "", "utf8");
    }
    const envFileContent = fs.readFileSync(path, "utf8");
    const envConfig = parse(envFileContent);
    return envConfig[key];
}

function envall(path = "./.env") {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "", "utf8");
    }
    const envFileContent = fs.readFileSync(path, "utf8");
    const envConfig = parse(envFileContent);
    return envConfig;
}

export { envall, parse, read, save };
export default {
    parse,
    save,
    read,
    envall,
};
