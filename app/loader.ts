import "@/env";
import "@/libs/basements";
import "@/libs/kernels";
import { Kernel } from "@/controllers/kernel";
import { Terminal } from "@/controllers/terminal";
if (process.argv.includes("--dev")) console.log(__("running_in_devmode"))
await Kernel.initialize();
//await Terminal.start();
