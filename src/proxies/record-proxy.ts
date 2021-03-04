import { SpraypaintBase } from "../model"
import { IResultProxy } from "./index"
import { JsonapiResponseDoc } from "../jsonapi-spec"
import { PersistedSpraypaintRecord } from "../model"

export class RecordProxy<T extends SpraypaintBase> implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc
  private _record: PersistedSpraypaintRecord<T>

  constructor(
    record: PersistedSpraypaintRecord<T>,
    raw_json: JsonapiResponseDoc
  ) {
    this._record = record
    this._raw_json = raw_json
  }

  get raw(): JsonapiResponseDoc {
    return this._raw_json
  }

  get data(): PersistedSpraypaintRecord<T> {
    return this._record
  }

  get meta(): Record<string, any> {
    return this.raw.meta || {}
  }
}
