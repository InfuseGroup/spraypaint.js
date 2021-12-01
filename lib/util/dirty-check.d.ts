import { SpraypaintBase, ModelAttributeChangeSet } from "../model";
import { IncludeScope } from "../scope";
declare class DirtyChecker<T extends SpraypaintBase> {
    model: T;
    constructor(model: T);
    checkRelation(relationName: string, relatedModel: SpraypaintBase): boolean;
    check(relationships?: IncludeScope): boolean;
    dirtyAttributes(): ModelAttributeChangeSet<T>;
    private _isUnpersisted;
    private _hasDirtyAttributes;
    private _hasDirtyRelationships;
    private _eachRelatedObject;
}
export default DirtyChecker;
