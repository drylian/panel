import { Configurations } from "@/config";
import { Config as Configuration } from "@/controllers/config";

export type ExtractObjectPath<T, Key extends keyof T> = Key extends string
    ? `${Key}`
    : never;

export type Paths<T> = ExtractObjectPath<T, keyof T>;

export type ValueOfConfig<T, P extends Paths<T>> = P extends
    `${infer Key}.${infer Rest}`
    ? Key extends keyof T
        ? Rest extends Paths<T[Key]> ? ValueOfConfig<T[Key], Rest>
        : never
    : never
    : P extends keyof T ? T[P]
    : never;
