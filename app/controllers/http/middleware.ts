interface MiddlewareOptions {
   /**
    * case middleware only work in expected routes
    */
   path?:string[];
   /**
    * Function of route
    */
   run(ctx: Context): Promise<any>;
}

class Middleware {

}