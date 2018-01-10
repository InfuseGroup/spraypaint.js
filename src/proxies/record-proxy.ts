import { JSORMBase } from '../model'
import { IResultProxy } from './index'
import { JsonapiResponseDoc } from '../jsonapi-spec'

export class RecordProxy<T extends JSORMBase> implements IResultProxy<T> {
  private _raw_json : JsonapiResponseDoc;
  private _record : T | null;

  constructor (record : T | undefined | null, raw_json : JsonapiResponseDoc) {
    this._record = (record || null)
    this._raw_json = raw_json;
  }

  get raw () : JsonapiResponseDoc {
    return this._raw_json;
  }

  get data () : T | null {
    return this._record;
  }

  get meta () : Record<string, any> {
    return this.raw.meta || {};
  }
}
