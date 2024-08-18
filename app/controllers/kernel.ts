import { Dimport, Glob } from "@/helpers.ts";
import { AnyReturn } from "@/types.ts";

interface KernelConstructor<IKernel> {
    identify: string;
    priority?: number;
    imports?: {
        paths: string[];
        import?: (
            module: unknown,
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
                const paths = await Glob(kernel.imports.paths);
                await Promise.all(paths.map(async (path) => {
                    const module = await Dimport(path);
                    kernel.imports?.import?.(module, kernel);
                }));
            }

            kernel.after?.(kernel);
        }));
    }
}
