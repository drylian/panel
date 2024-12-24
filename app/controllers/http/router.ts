import { Context } from "elysia";
import { ElysiaInstance } from "../../types/elysia";

interface RouterPermission {
   /**
    * Permisson Reference
    */
   permission: string;
   /**
    * Description of Permission
    */
   description: string;
   /**
    * Title of permission
    */
   title: string;
   /**
    * This permission is default in commun user
    */
   default?: boolean;
}

interface RouterOptions {
   /**
    * Add permission required in router
    */
   permission?: RouterPermission;

   run:ElysiaInstance["get"];
}

export enum RouteType {
   Get = "get",
   Post = "post",
   Put = "put",
   Delete = "delete"
}

export class Router<RoutePath extends string, RouteOptions extends RouterOptions> {
   public static readonly types = RouteType;
   public readonly path;
   public readonly permission;
   public readonly run;
   constructor(path: RoutePath, options: RouteOptions) {
      this.path = path;
      this.permission = options.permission;
      this.run = options.run;
   }
}

new Router("/test", {
   permission: {
      permission: "valor",
      title: "Test",
      description: "Test",
      default:false // caso default seja true vai a perm vai ser considerada padrão para usuario caso ele esteja logado
   },
   allow: ["session", "token"],
   run:("/tes", )
})