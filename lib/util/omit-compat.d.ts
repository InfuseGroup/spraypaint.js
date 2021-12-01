export declare type DiffCompat<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type OmitCompat<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
