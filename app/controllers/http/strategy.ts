import { ElysiaContext, IElysia } from "@/types/elysia";

/**
 * Authenticator
 */
export class Strategy<
  StrategyType extends string,
  StratefyCheck extends ((ctx:ElysiaContext) => boolean) ,
  StrategyAuthenticate extends (ctx:ElysiaContext) => any,
  StrategyError extends ((error:Error, ctx: ElysiaContext) => any)> {

  public type;
  public check;
  public authenticate;
  public error;
  constructor(options: {
    /**
     * Type of Strategy
     */
    type: StrategyType;
    /**
     * Check if Strategy is correct
     */
    check: StratefyCheck;
    /**
     * Authenticate strategy
     */
    authenticate: StrategyAuthenticate;
    /**
     * Case strategy gerate error
     */
    onError?:StrategyError;
  }) {
    this.type = options.type;
    this.check = options.check;
    this.authenticate = options.authenticate;
    this.error = options.onError;
  }
}
