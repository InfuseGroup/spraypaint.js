export { CollectionProxy } from './collection-proxy'
export { RecordProxy } from './record-proxy'
import { JsonapiResponseDoc } from '../jsonapi-spec'

export interface IResultProxy<T> {
  data: T | T[] | null
  meta: Record<string, any>
  raw: JsonapiResponseDoc
}