import { Configurations } from "@/config";
import { Config as Configuration } from "@/controllers/config";
import { Lang } from "@/controllers/langs";
import { Console as IConsole } from "console";
declare global {
    var Config: typeof Configuration;
    var Language:typeof Lang;
    var __Configurations: Configurations;
    interface Console {
        /**
         * Use namespace of translation
         * @param ns 
         * @returns 
         */
        use: (ns: string) => void;
    }
    interface globalThis {
        Config: typeof Configuration;
        Language:typeof Lang;
        __Configurations: Configurations;
    }
}
