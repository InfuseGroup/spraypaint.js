import { JsonapiResponseDoc } from "../jsonapi-spec";
import { IResultProxy } from "./index";
import { SpraypaintBase } from "../model";
export declare class NullProxy<T extends SpraypaintBase = SpraypaintBase> implements IResultProxy<T> {
    private _raw_json;
    constructor(raw_json: JsonapiResponseDoc);
    get raw(): JsonapiResponseDoc;
    get data(): null;
    get meta(): Record<string, any>;
}
