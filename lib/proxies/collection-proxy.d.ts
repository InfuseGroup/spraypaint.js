import { SpraypaintBase, PersistedSpraypaintRecord } from "../model";
import { IResultProxy } from "./index";
import { JsonapiResponseDoc } from "../jsonapi-spec";
export declare class CollectionProxy<T extends SpraypaintBase> implements IResultProxy<T> {
    private _raw_json;
    private _collection;
    constructor(collection: PersistedSpraypaintRecord<T>[], raw_json?: JsonapiResponseDoc);
    get raw(): JsonapiResponseDoc;
    get data(): PersistedSpraypaintRecord<T>[];
    get meta(): Record<string, any>;
}
