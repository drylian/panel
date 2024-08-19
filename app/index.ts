import "@/helpers.ts";
import "@/config/index.ts";
import { Kernel } from "@/controllers/kernel.ts";
import { Configuration } from "@/controllers/configuration.ts";
import { watch } from "node:fs";
import { Global } from "@/config/index.ts";
import { Vite } from "@/libs/vite.ts";
import { opine } from "opine";
import { Terminal } from "@/controllers/terminal.ts";
import { Database } from "@/controllers/database.ts";
import { Model } from "denodb";
console.log("Loading [kernels].green...");
let timeout: number | null = null;

/**
 * Watcher of env options
 */
new Kernel({
    identify: "Configuration",
    priority:0,
    after() {
        watch(".env", function () {
            if (!timeout) {
                Configuration.config();
                timeout = setTimeout(function () {
                    timeout = null;
                }, 100);
            }
        });
    },
});

/**
 * Database Configuration
 */
new Kernel({
    identify: "Database",
    priority:1,
    imports: {
        paths: ["models/**/*.ts"],
        import(modul) {
            const model = modul as { default:typeof Model }
            if (Database.schemas) {
                Database.schemas.push(model.default);
            }
        },
    },
    async after() {
        Database.preset();
        await Database.initialize();
    },
});

/**
 * Http configuration Kernel
 */
new Kernel({
    identify: "Http",
    after() {
        const app = opine();

        if (Global.node.get === "development") {
            Vite(Global.port.get, Global.dev_port.get);
            console.log(
                `[RESTAPI].blue is running on port ${Global.dev_port.get}`,
            );
            console.log(`[VITE].blue is running on port ${Global.port.get}`);
        } else {
            console.log(`Dashboard is running on port ${Global.dev_port.get}`);
        }

        app.listen({
            port: (Global.node.get === "development"
                ? Global.dev_port.get
                : Global.port.get),
            hostname: Global.hostname.get,
        });
    },
});

await Kernel.initialize();
await Terminal.start();
