import * as readline from "readline";

export interface TerminalCommandContructor {
  /**
   * Command name, used in <command> <args>
   */
  name: string;
  /**
   * Visually used by the terminal and in the aid command
   */
  desc: string;
  /**
   * Visually used by the terminal and in the aid command
   */
  args?: string[];
  /**
   * Run Terminal Command
   * @param term Terminal actions
   * @param args Arguments
   */
  run: (
    term: TerminalCommandContructor & Terminal,
    args: string[],
  ) => Promise<any>;
}

/**
 * Enable terminal commands in Application Panel
 */
export class Terminal {
  /**
   * Readline, for commands interactions
   */
  static rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  /**
   * Map of All cmds registred
   */
  static cmds = new Map<string, TerminalCommandContructor>();
  constructor(cmd: TerminalCommandContructor) {
    Terminal.cmds.set(cmd.name, cmd);
  }

  /**
   * Start Terminal interactions
   */
  public static async start() {
    console.log(__("terminal_welcome"));
    Terminal.rl.question(
      `> ${__("terminal_action")}:`,
      Terminal.input.bind(this),
    );
    Terminal.rl.on("close", () => {
      console.log(__("terminal_finishing_message"));
      process.exit(0);
    });
  }

  /**
   * Process Input texts
   * @param input
   */
  private static async input(input: string) {
    const [cmd, ...args] = input.trim().split(" ");
    console.clear();
    const command = Terminal.cmds.get(cmd);
    if (command) {
      console.log(
        __("terminal_executing_command", {
          command: command.name,
          args: args.join(" "),
        }),
      );
      Terminal.rl.pause();
      await command.run({ ...command, ...this }, args);
    } else {
      const similar = [...Terminal.cmds.keys()].filter((c) => c.includes(cmd));
      if (similar.length > 0) {
        console.log(
          "----------------------------------------------------------------",
        );
        console.warn(__("terminal_command_not_found"));
        console.log(__("terminal_available_commands"));
        similar.map((cmmd) => {
          const command = Terminal.cmds.get(cmmd);
          if (command)
            console.log(
              `    ${__("terminal_command_show", { command: command.name, args: command.args ? `< [${command.args.join("].lime [|].reset [")}].lime >` : "", desc: command.desc })}`,
            );
        });
        console.log(
          "----------------------------------------------------------------",
        );
      } else {
        console.log(
          "----------------------------------------------------------------",
        );
        console.warn(`[Command not found.].red-b`);
        console.log(
          "----------------------------------------------------------------",
        );
      }
    }
    Terminal.rl.resume();
    Terminal.rl.question("> action:", this.input.bind(this));
  }
}
