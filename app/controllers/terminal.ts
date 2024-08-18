import { AnyReturn } from "@/types.ts";

export interface Command {
    name: string;
    description: string;
    args?: string[];
    run: (term: Terminal, args: string[]) => AnyReturn;
}

export class Terminal {
    public static cmds = new Map<string, Terminal>();

    constructor(public readonly cmd: Command) {
        Terminal.cmds.set(cmd.name, this);
    }

    public async input() {
        return await Terminal.input();
    }
    public static async input() {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        await Deno.stdout.write(encoder.encode("> input:"));
        const inputBuffer = new Uint8Array(1024);
        const n = <number> await Deno.stdin.read(inputBuffer);
        const text = decoder.decode(inputBuffer.subarray(0, n)).trim();
        return text;
    }

    public static async start() {
        console.log(
            "Welcome to [Terminal].blue interactions! digit [help].gold-b for view console commands",
        );
        do {
            const result = await this.input();

            const [cmdName, ...args] = result.split(/\s+/);
            const command = Terminal.cmds.get(cmdName);
            if (command) {
                try {
                    console.clear();
                    console.log(`Executing [${result}].blue`);
                    await command.cmd.run(command, args);
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            } else {
                if (cmdName) console.warn(`Unknown command: ${cmdName}`);
            }
        } while (true);
    }
}

new Terminal({
    name: "help",
    description: "View console [commands].blue",
    args: ["page"],
    run: (_, args) => {
        const cmds = Array.from(Terminal.cmds.values());
        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 5;
        const totalPages = Math.ceil(cmds.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const commandsToShow = cmds.slice(start, end);

        if (commandsToShow.length === 0) {
            console.log(`No commands found for page [${page}].blue. Available pages: 1-[${totalPages}].gold`);
        }

        const helpText = commandsToShow.map((cmd) => {
            return `> [${cmd.cmd.name}].gold <[${cmd.cmd.args?.join("].green> <[")}].green> - ${cmd.cmd.description}`;
        }).join("\n");

        console.log(`Commands (Page [${page}].blue/[${totalPages}].blue):\n${helpText}`);
    },
});
