export declare type BeforeFilter = (requestUrl: string, options: RequestInit) => void;
export declare type AfterFilter = (response: Response, json: JSON) => void;
export declare class MiddlewareStack {
    private _beforeFilters;
    private _afterFilters;
    constructor(before?: BeforeFilter[], after?: AfterFilter[]);
    get beforeFilters(): BeforeFilter[];
    get afterFilters(): AfterFilter[];
    beforeFetch(requestUrl: string, options: RequestInit): Promise<void>;
    afterFetch(response: Response, json: JSON): Promise<void>;
}
