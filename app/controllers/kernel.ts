import { type AnyReturn } from "@/types/types";
import { glob } from "glob";
import { readFile } from "node:fs/promises";

interface KernelConstructor<IKernel> {
    identify: string;
    priority?: number;
    imports?: {
        type: "json" | "module";
        paths: string[];
        cwd?: string;
        action?: (
            file: unknown,
            path: string,
            kernel: Kernel<IKernel>,
        ) => AnyReturn;
    };
    after?: (options: Kernel<IKernel>) => AnyReturn;
}

export class Kernel<IKernel> {
    public static readonly kernels: Kernel<unknown>[] = [];
    public readonly identify: KernelConstructor<IKernel>["identify"];
    public readonly imports: KernelConstructor<IKernel>["imports"];
    public readonly after: KernelConstructor<IKernel>["after"];
    public readonly priority: number;
    constructor(options: KernelConstructor<IKernel>) {
        this.identify = options.identify;
        this.imports = options.imports;
        this.priority = options.priority ?? 1000;
        this.after = options.after;
        Kernel.kernels.push(this);
    }

    public static async initialize() {
        Kernel.kernels.sort((a, b) => a.priority - b.priority);

        await Promise.all(Kernel.kernels.map(async (kernel) => {
            if (kernel.imports) {
                if (kernel.imports.type == "module") {
                    const paths = await glob(
                        kernel.imports.paths,
                        kernel.imports.cwd ? { cwd: kernel.imports.cwd } : {},
                    );
                    await Promise.all(paths.map(async (path) => {
                        const module = await import(path);
                        kernel.imports?.action!(module, path, kernel);
                    }));
                } else {
                    const paths = await glob(
                        kernel.imports.paths,
                        kernel.imports.cwd ? { cwd: kernel.imports.cwd } : {},
                    );
                    await Promise.all(paths.map(async (path) => {
                        const module = await readFile(path, "utf-8");
                        kernel.imports?.action!(module, path, kernel);
                    }));
                }
            }

            kernel.after?.(kernel);
        }));
    }
}
