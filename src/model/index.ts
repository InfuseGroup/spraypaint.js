// import Config from '../configuration';
import { CollectionProxy, RecordProxy } from '../proxies';
// import _extend from '../util/extend';
// import { camelize } from '../util/string';
// import WritePayload from '../util/write-payload';
// import IncludeDirective from '../util/include-directive';
// import ValidationErrors from '../util/validation-errors';
// import refreshJWT from '../util/refresh-jwt';
import relationshipIdentifiersFor from '../util/relationship-identifiers';
// import Request from '../request';

import cloneDeep from '../util/clonedeep';
import { deserialize, deserializeInstance } from '../util/deserialize';
import { Attribute } from '../attribute';
import DirtyChecker from '../util/dirty-check';
import { Scope, WhereClause, SortScope, FieldScope, StatsScope } from '../scope';
import { TypeRegistry } from '../type-registry'
import { camelize } from 'inflected'
import { IncludeArg } from '../util/include-directive';

export interface ModelConfiguration {
  baseUrl : string
  apiNamespace : string
  jsonapiType : string
  endpoint : string;
  isJWTOwner : boolean
  jwt : string
  camelizeKeys : boolean
  strictAttributes : boolean
}

export type ModelConfigurationOptions = Partial<ModelConfiguration> 

export type ExtendedModel<
  Subclass extends JSORMBase, 
  Attributes, 
  Methods
> = 
  JSORMBase &
  Subclass &
  Attributes &
  Methods

export type AttrMap<T> = {
  [P in keyof T]: Attribute<T[P]>;
}

export type DefaultAttrs = Record<string, any>
export type DefaultMethods<V> =  { [key: string]: (this: V, ...args: any[]) => any };

export interface ExtendOptions<
  M,
  Attributes=DefaultAttrs,
  Methods=DefaultMethods<M>
  > {
  static?: ModelConfigurationOptions
  config?: ModelConfigurationOptions
  attrs?: AttrMap<Attributes>
  methods?: ThisType<M & Attributes & Methods> & Methods
}

export interface ModelConstructor<M extends JSORMBase, Attrs> {
  // new (attrs?: Partial<Attrs>) : M
  new (attrs?: Record<string, any>) : M
  extend<ExtendedAttrs, Methods> (
    // this: { new(attrs?: Partial<Attrs>) : M }, 
    this: { new(attrs?: Record<string, any>) : M }, 
    options : ExtendOptions<M, ExtendedAttrs, Methods>
  ) : ModelConstructor<
      ExtendedModel<M, ExtendedAttrs, Methods>, 
      Attrs & ExtendedAttrs
    >
  inherited(subclass : typeof JSORMBase) : void
  registerType() : void

  attributeList : Attrs
  extendOptions : any//ExtendOptions<M, Attributes, Methods>
  parentClass : typeof JSORMBase;
  currentClass : typeof JSORMBase;
  isJSORMModel : boolean
  isBaseClass : boolean
  typeRegistry : TypeRegistry

  baseUrl : string
  apiNamespace : string
  jsonapiType? : string
  endpoint : string;
  isJWTOwner : boolean
  jwt? : string;
  camelizeKeys : boolean
  strictAttributes : boolean
}

function extendModel<
  MC extends ModelConstructor<M, Attrs>, 
  M extends JSORMBase, 
  Attrs, 
  ExtendedAttrs, 
  Methods
>(
  Superclass: ModelConstructor<M, Attrs>, 
  options : ExtendOptions<M, ExtendedAttrs, Methods>
) : ModelConstructor<ExtendedModel<M, ExtendedAttrs, Methods>, Attrs & ExtendedAttrs> {
  class Subclass extends (<ModelConstructor<JSORMBase, Attrs>>Superclass) {
    // constructor(attrs?: Partial<Attrs & ExtendedAttrs>) {
    // constructor(attrs?: Record<string, any>) {
    //   super(attrs)
    // }
  }

  Superclass.inherited(<any>Subclass)
  
  let attrs : any = {}
  if (options.attrs) {
    for(let key in options.attrs) {
      let attr = options.attrs[key]

      if(!attr.name) {
        attr.name = key
      }

      attr.owner = <any>Subclass

      attrs[key] = attr
    }
  }

  Subclass.attributeList = Object.assign({}, Subclass.attributeList, attrs)

  if (options.static) {
    applyModelConfig(Subclass, options.static)
  }

  if (options.config) {
    applyModelConfig(Subclass, options.config)
  }

  Subclass.registerType()

  if (options.methods) {
    for(const methodName in options.methods) {
      (<any>Subclass.prototype)[methodName] = options.methods[methodName]
    }
  }

  return <any>Subclass
}

export function applyModelConfig<
  M extends JSORMBase, 
  Attrs, 
  ExtendedAttrs,
  Methods
>(
  ModelClass : ModelConstructor<ExtendedModel<M, Attrs, Methods>, Attrs & ExtendedAttrs>, 
  config: ModelConfigurationOptions
) : void {
  let k : keyof ModelConfigurationOptions

  for(k in config) {
    ModelClass[k] = config[k]
  }    
}

export class JSORMBase {
  static baseUrl = 'http://please-set-a-base-url.com'
  static apiNamespace = '/'
  static jsonapiType? : string
  static endpoint : string
  static isBaseClass : boolean
  static isJWTOwner : boolean = false
  static jwt? : string;
  static camelizeKeys : boolean = true
  static strictAttributes : boolean = false

  static attributeList : Record<string, Attribute> = {}
  static extendOptions : any
  static parentClass : typeof JSORMBase
  static currentClass : typeof JSORMBase = JSORMBase
  private static _typeRegistry : TypeRegistry

  // This is to allow for sane type checking in collaboration with the 
  // isModelClass function exported below.  It is very hard to find out whether
  // something is a class of a certain type or subtype
  // (as opposed to an instance of that class), so we set a magic prop on this
  // for use around the code.
  static readonly isJSORMModel : boolean = true

  id? : string;
  temp_id? : string;
  _attributes : Record<string, any>
  _originalAttributes : Record<string, any>
  __meta__ : any
  relationships : Record<string, JSORMBase | JSORMBase[]> = {}
  _originalRelationships : Record<string, JsonapiResourceIdentifier[]> = {}
  klass : typeof JSORMBase
  private _persisted : boolean = false;
  private _markedForDestruction: boolean = false;
  private _markedForDisassociation: boolean = false;

  static fromJsonapi(resource: JsonapiResource, payload: JsonapiDoc) : any {
    return deserialize(this.typeRegistry, resource, payload);
  }

  static inherited(subclass : typeof JSORMBase) : void {
    subclass.parentClass = this;
    subclass.currentClass = subclass;
    subclass.prototype.klass = subclass;
    subclass.attributeList = cloneDeep(subclass.attributeList)

    if (this.isBaseClass === undefined) {
      subclass.setAsBase()
    } else if (this.isBaseClass === true) {
      subclass.isBaseClass = false
    }
  }

  static setAsBase() : void {
    this.isBaseClass = true
    this.jsonapiType = undefined

    if (!this.typeRegistry) {
      this.typeRegistry = new TypeRegistry(this)
    }
  }

  static isSubclassOf(maybeSuper : typeof JSORMBase) : boolean {
    let current = this.currentClass

    while(current) {
      if(current === maybeSuper) {
        return true
      }

      current = current.parentClass
    }

    return false
  }

  static get baseClass() {
    let current = this.currentClass

    while(current) {
      if (current.isBaseClass) {
        return current
      }

      current = current.parentClass
    }

    throw new Error(`No Base Class for ${this}`)
  }

  static get typeRegistry() : TypeRegistry {
    return this.baseClass._typeRegistry
  }

  static set typeRegistry(registry: TypeRegistry) {
    if (!this.isBaseClass) {
      throw new Error('Cannot set a registry on a non-base class')
    }

    this._typeRegistry = registry
  }

  static registerType() : void {
    if (!this.jsonapiType) { return }

    let existingType = this.typeRegistry.get(this.jsonapiType)

    if (existingType) {
      // Don't try to register a type of we're looking
      // at a subclass. Otherwise we'll make a register
      // call which will fail in order to get a helpful
      // error message from the registry
      if (this.isSubclassOf(existingType)) { return }
    }

    this.typeRegistry.register(this.jsonapiType, this)
  }

  static extend<
    MC extends ModelConstructor<M, Attrs>, 
    M extends JSORMBase,
    Attrs, 
    ExtendedAttrs,
    Methods
  >(
    this : { new(...args: any[]) : M }, 
    options : ExtendOptions<M, ExtendedAttrs, Methods>
  ) : ModelConstructor<ExtendedModel<M, ExtendedAttrs, Methods>, Attrs & ExtendedAttrs> {
    const Super = this as MC
    const Subclass = extendModel(Super, options)

    return Subclass
  }

  constructor(attrs? : Record<string, any>) {
    this._initializeAttributes();
    this.assignAttributes(attrs)
  }

  // Define getter/setters 
  private _initializeAttributes() {
    this._attributes = {}
    this._originalAttributes = {}
    const attrs = this.klass.attributeList 
    for (let key in attrs) {
      let attr = attrs[key];
      if (attr.isRelationship) {
        let foo = 'bar'
      }
      Object.defineProperty(this, key, attr.descriptor());
    }
  }

  isType(jsonapiType : string) {
    return this.klass.jsonapiType === jsonapiType;
  }

  get isPersisted() : boolean {
    return this._persisted;
  }
  set isPersisted(val : boolean) {
      this._persisted = val;
      this._originalAttributes = cloneDeep(this._attributes);
      this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
  }

  get isMarkedForDestruction() : boolean {
    return this._markedForDestruction;
  }
  set isMarkedForDestruction(val : boolean) {
    this._markedForDestruction = val
  }

  get isMarkedForDisassociation() : boolean {
    return this._markedForDisassociation;
  }
  set isMarkedForDisassociation(val : boolean) {
    this._markedForDisassociation = val
  }

  get attributes() {
    return this._attributes
  }

  set attributes(attrs : Record<string, any>) {
    this._attributes = {};
    this.assignAttributes(attrs);
  }

  relationship(name : string) : Array<JSORMBase> | JSORMBase | undefined {
    return this.relationships[name]
  }

  assignAttributes(attrs? : Record<string, any>) : void {
    if (!attrs) { return }
    for(var key in attrs) {
      let attributeName = key;

      if (this.klass.camelizeKeys) {
        attributeName = camelize(key, false);
      }
      
      if (key == 'id' || this.klass.attributeList[attributeName]) {
        (<any>this)[attributeName] = attrs[key];
      } else if (this.klass.strictAttributes) {
        throw new Error(`Unknown attribute: ${key}`)
      }
    }
  }

  relationshipResourceIdentifiers(relationNames: Array<string>) {
    return relationshipIdentifiersFor(this, relationNames);
  }

  fromJsonapi(resource: JsonapiResource, payload: JsonapiDoc, includeDirective: Object = {}) : any {
    return deserializeInstance(this, resource, payload, includeDirective);
  }

  get resourceIdentifier() : JsonapiResourceIdentifier {
    if (this.klass.jsonapiType === undefined) {
      throw new Error('Cannot build resource identifier for class. No JSONAPI Type specified.')
    }

    return { 
      id: this.id,
      type: this.klass.jsonapiType
     }
  }

  get hasError() {
    return Object.keys(this.errors).length > 1;
  }

  isDirty(relationships?: IncludeArg) : boolean {
    let dc = new DirtyChecker(this);
    return dc.check(relationships);
  }

  changes() : Object {
    let dc = new DirtyChecker(this);
    return dc.dirtyAttributes();
  }

  hasDirtyRelation(relationName: string, relatedModel: JSORMBase) : boolean {
    let dc = new DirtyChecker(this);
    return dc.checkRelation(relationName, relatedModel);
  }

  dup() : JSORMBase {
    return cloneDeep(this);
  }
  
  /*
   *
   * Model Persistence Methods
   * 
   */
  static fetchOptions() : RequestInit {
    let options = {
      headers: {
        Accept: 'application/json',
        ['Content-Type']: 'application/json'
      } as any
    }

    if (this.getJWT()) {
      options.headers.Authorization = `Token token="${this.getJWT()}"`;
    }

    return options
  }

  static url(id?: string | number) : string {
    let endpoint = this.endpoint || `/${this.jsonapiType}`;
    let base = `${this.fullBasePath()}${endpoint}`;

    if (id) {
      base = `${base}/${id}`;
    }

    return base;
  }

  static fullBasePath() : string {
    return `${this.baseUrl}${this.apiNamespace}`;
  }

  static scope<I extends JSORMBase>(this: JSORMPersistenceConstructor<I>) : Scope<I> {
    return new Scope(this)
    // return this._scope || new Scope(this);
  }

  static first() {
    return this.scope().first();
    // return Promise.resolve(this)
  }
  static all() {
    return this.scope().all();
  }

  static find(id : string | number) {
    return this.scope().find(id);
  }

  static where(clause: WhereClause) : Scope {
    return this.scope().where(clause);
  }

  static page(number: number) : Scope {
    return this.scope().page(number);
  }

  static per(size: number) : Scope {
    return this.scope().per(size);
  }

  static order(clause: SortScope) : Scope {
    return this.scope().order(clause);
  }

  static select(clause: FieldScope) : Scope {
    return this.scope().select(clause);
  }

  static selectExtra(clause: FieldScope) : Scope {
    return this.scope().selectExtra(clause);
  }

  static stats(clause: StatsScope) : Scope {
    return this.scope().stats(clause);
  }

  static includes(clause: IncludeArg) : Scope {
    return this.scope().includes(clause);
  }

  static merge(obj : Scope) : Scope {
    return this.scope().merge(obj);
  }

  static getJWT() : string | undefined {
    let owner = this.getJWTOwner();

    if (owner) {
      return owner.jwt;
    }
  }

  static getJWTOwner() : typeof JSORMBase | undefined {
    if (this.isJWTOwner) {
      return this
    } else {
      if (this.parentClass) {
        return this.parentClass.getJWTOwner()
      } else {
        return
      }
    }
  }
}; 

(<any>JSORMBase.prototype).klass = JSORMBase

// Break up types to remove the generics we don't need for the
// persistence stuff
export type JSORMPersistenceConstructor<C extends JSORMBase> = { 
  new(...args: any[]) : C 
  fetchOptions() : RequestInit
  url(id?: string | number) : string
  scope() : Scope<C>
}

let validate : JSORMPersistenceConstructor<JSORMBase> = JSORMBase

// export abstract class OldModel {

//   _originalRelationships: Object = {};
//   relationships: Object = {};
//   errors: Object = {};
//   __meta__: Object | null = null;

//   private static _scope: Scope;

//   static extend(obj : any) : any {
//     return _extend(this, obj);
//   }


//   static setJWT(token: string) : void {
//     this.getJWTOwner().jwt = token;
//   }


//   clearErrors() {
//     this.errors = {};
//   }

//   // Todo:
//   // * needs to recurse the directive
//   // * remove the corresponding code from isPersisted and handle here (likely
//   // only an issue with test setup)
//   // * Make all calls go through resetRelationTracking();
//   resetRelationTracking(includeDirective: Object) {
//     this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(includeDirective));
//   }



//   destroy() : Promise<any> {
//     let url     = this.klass.url(this.id);
//     let verb    = 'delete';
//     let request = new Request();

//     let requestPromise = request.delete(url, this._fetchOptions());
//     return this._writeRequest(requestPromise, () => {
//       this.isPersisted = false;
//     });
//   }

//   save(options: Object = {}) : Promise<any> {
//     let url     = this.klass.url();
//     let verb    = 'post';
//     let request = new Request();
//     let payload = new WritePayload(this, options['with']);

//     if (this.isPersisted) {
//       url  = this.klass.url(this.id);
//       verb = 'put';
//     }

//     let json = payload.asJSON();
//     let requestPromise = request[verb](url, json, this._fetchOptions());
//     return this._writeRequest(requestPromise, (response) => {
//       this.fromJsonapi(response['jsonPayload'].data, response['jsonPayload'], payload.includeDirective);
//       //this.isPersisted = true;
//       payload.postProcess();
//     });
//   }

//   private _writeRequest(requestPromise : Promise<any>, callback: Function) : Promise<any> {
//     return new Promise((resolve, reject) => {
//       requestPromise.catch((e) => { throw(e) });
//       return requestPromise.then((response) => {
//         this._handleResponse(response, resolve, reject, callback);
//       });
//     });
//   }

//   private _handleResponse(response: any, resolve: Function, reject: Function, callback: Function) : void {
//     refreshJWT(this.klass, response);

//     if (response.status == 422) {
//       ValidationErrors.apply(this, response['jsonPayload']);
//       resolve(false);
//     } else if (response.status >= 500) {
//       reject('Server Error');
//     } else {
//       callback(response);
//       resolve(true);
//     }
//   }

//   private _fetchOptions() : RequestInit {
//     return this.klass.fetchOptions()
//   }
// }



export function isModelClass(arg: any) : arg is typeof JSORMBase {
  if (!arg) { return false }
  return arg.currentClass && arg.currentClass.isJSORMModel
}

export function isModelInstance(arg: any) : arg is JSORMBase {
  if (!arg) { return false }
  return isModelClass(arg.constructor.currentClass)
}