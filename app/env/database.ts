import { AddConfig } from "@/libs/config";
import { DBDialect } from "@/types/types";

export default [
   /**
     * The database dialect (sqlite | mysql).
      */
   AddConfig("db.dialect", {
      prop: "DB_DIALECT",
      default: "sqlite",
      description: "Application database dialect",
      check(conf, oldvalue, newvalue) {
         if (!oldvalue && !newvalue) return conf.default;
         if (newvalue) {
            if (["sqlite", "mysql", "postgres", "mongodb"].includes(newvalue)) {
               return newvalue as DBDialect;
            } else return oldvalue ? oldvalue : conf.default;
         }
         return oldvalue ? oldvalue : conf.default;
      },
   }),

   /**
    * The username used for database authentication.
    */
   AddConfig("db.username", {
      prop: "DB_USERNAME",
      default: "root",
      description: "Application database username",
   }),

   /**
    * The password used for database authentication.
    */
   AddConfig("db.password", {
      prop: "DB_PASSWORD",
      description: "Application database password",
   }),

   /**
    * The name of the database to connect to.
    */
   AddConfig("db.database", {
      prop: "DB_DATABASE",
      description: "Application database database name",
   }),

   /**
    * The host address of the database server.
    */
   AddConfig("db.hostname", {
      prop: "DB_HOSTNAME",
      description: "Application database hostname",
   }),
] as const;