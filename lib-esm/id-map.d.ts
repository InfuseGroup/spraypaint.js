import { SpraypaintBase } from "./model";
export declare class IDMap {
    data: Record<string, any>;
    get count(): number;
    find(model: SpraypaintBase, key?: string | null): any;
    findAll(models: SpraypaintBase[]): SpraypaintBase[];
    create(model: SpraypaintBase, key: string): void;
    updateOrCreate(model: SpraypaintBase): void;
    destroy(model: SpraypaintBase): void;
    private keyFor;
}
