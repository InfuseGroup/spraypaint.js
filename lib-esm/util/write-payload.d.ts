import { SpraypaintBase, ModelRecord } from "../model";
import { IncludeScopeHash } from "./include-directive";
import { IncludeScope } from "../scope";
import { JsonapiRequestDoc, JsonapiResource } from "../jsonapi-spec";
export declare class WritePayload<T extends SpraypaintBase> {
    model: T;
    jsonapiType: string;
    includeDirective: IncludeScopeHash;
    included: JsonapiResource[];
    idOnly: boolean;
    constructor(model: T, relationships?: IncludeScope, idOnly?: boolean);
    attributes(): ModelRecord<T>;
    removeDeletions(model: T, includeDirective: IncludeScope): void;
    postProcess(): void;
    relationships(): object;
    asJSON(): JsonapiRequestDoc;
    private _isNewAndMarkedForDestruction;
    private _processRelatedModel;
    private _resourceIdentifierFor;
    private _pushInclude;
    private _isIncluded;
    private _eachAttribute;
}
