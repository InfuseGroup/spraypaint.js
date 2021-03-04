import { SpraypaintBase, PersistedSpraypaintRecord } from "../model"
import { IResultProxy } from "./index"
import { JsonapiResponseDoc } from "../jsonapi-spec"

export class CollectionProxy<T extends SpraypaintBase>
  implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc
  private _collection: PersistedSpraypaintRecord<T>[]

  constructor(
    collection: PersistedSpraypaintRecord<T>[],
    raw_json: JsonapiResponseDoc = { data: [] }
  ) {
    this._collection = collection
    this._raw_json = raw_json
  }

  get raw(): JsonapiResponseDoc {
    return this._raw_json
  }

  get data(): PersistedSpraypaintRecord<T>[] {
    return this._collection
  }

  get meta(): Record<string, any> {
    return this.raw.meta || {}
  }
}
