import { Glob } from "bun";
import path from "path";

interface KernelConstructor {
   path?: string | string[];
   cwd?: string;
   priority?: number;
   run?<Module extends unknown>(options: {
      module: Module;
      kernel: Kernel;
      filepath: string;
   }): any;
   after?(kernel: Kernel): any;
}

export class Kernel {
   public static readonly kernels: Kernel[] = [];
   public readonly path;
   public readonly priority;
   public readonly cwd;
   public readonly run;
   public readonly after;
   constructor(options: KernelConstructor) {
      this.path = options.path;
      this.priority = options.priority ?? 1000;
      this.run = options.run;
      this.after = options.after;
      this.cwd = options.cwd ? options.cwd : path.resolve(import.meta.dirname, "..");
      Kernel.kernels.push(this);
   }

   public static async initialize(...kernels: Kernel[]) {
      if (!kernels.length) kernels = this.kernels;
      kernels.sort((a, b) => a.priority - b.priority);
      await Promise.all(kernels.map(async (kernel) => {
         if (kernel.path) {
            const patterns = Array.isArray(kernel.path) ? kernel.path : [kernel.path];
            patterns.forEach(async locale => {
               const glob = new Glob(locale);
               for await (const file of glob.scan({ cwd: kernel.cwd })) {
                  const data = await import(path.relative(import.meta.dirname, path.join(kernel.cwd, file)));
                  if(kernel.run) kernel.run({
                     module: data,
                     filepath:path.join(kernel.cwd, file),
                     kernel: kernel
                  })
               }
            })
         }

         await kernel.after?.(kernel);
      }));
   }
}
