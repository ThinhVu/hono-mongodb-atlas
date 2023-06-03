import type { Context, Next } from 'hono'
import * as Realm from 'realm-web'

import RealmServices = globalThis.Realm.Services
import MongoDB = RealmServices.MongoDB

type MongoDBDatabase = RealmServices.MongoDBDatabase
type Document = MongoDB.Document

export interface Env {
   REALM_APP_ID: string;
   REALM_API_KEY: string;
   REALM_DEFAULT_DB_NAME: string;
}

let App: Realm.App
let user
let client: MongoDB

export const KEYS = {
   APP: 'mongodb-atlas-app',
   USER: 'mongodb-atlas-user',
   CLIENT: 'mongodb-atlas-client',
}

export interface IMongoDBAtlasOptions {
   defaultDb?: string; // provide is default db to use
   realmAppId?: string; // if missing, you need to provide REALM_APP_ID in Bindings
   realmApiKey?: string; // if missing, you need to provide REALM_API_KEY in Bindings
   realmName?: string; // an identifier for this realm instance
}

export function mongoDBAtlas(options?: IMongoDBAtlasOptions) {
   return async function(c: Context, next: Next) {
      if (App) {
         await next()
         return
      }

      const opts = options || {}
      const realmAppId = opts.realmAppId || c.env.REALM_APP_ID
      if (!realmAppId)
         throw new Error('options.realmAppId and env.REALM_APP_ID is not configured')

      const realmApiKey = opts.realmApiKey || c.env.REALM_API_KEY
      if (!realmApiKey)
         throw new Error('options.realmApiKey and env.REALM_API_KEY is not configured')

      App = new Realm.App(realmAppId)
      user = await App.logIn(Realm.Credentials.apiKey(realmApiKey))
      client = user.mongoClient('mongodb-atlas')

      // for one who want to inspect raw components
      c.set(`${opts.realmName}-${KEYS.APP}`, App)
      c.set(`${opts.realmName}-${KEYS.USER}`, user)
      c.set(`${opts.realmName}-${KEYS.CLIENT}`, client)

      const dbCache: Record<string, MongoDBDatabase> = {}
      function getDb(name: string): MongoDBDatabase {
         if (!dbCache[name])
            dbCache[name] = client.db(name)
         return dbCache[name]
      }

      const collectionCache: Record<string, MongoDB.MongoDBCollection<Document>> = {}
      function getCollection<T extends Document>(collectionName: string, dbName?: string): MongoDB.MongoDBCollection<T> {
         dbName = dbName || opts.defaultDb || c.env.REALM_DEFAULT_DB_NAME;
         if (!dbName)
            throw new Error('defaultDb is not configured, you need to provide dbName explicitly')
         const key = `${dbName}--${collectionName}`
         if (!collectionCache[key])
            collectionCache[key] = getDb(dbName).collection(collectionName)
         return collectionCache[key] as MongoDB.MongoDBCollection<T>
      }

      // proxy for default db access
      const model = new Proxy(getCollection, {
         get: (__, collName) => getCollection(collName.toString())
      })

      c.set(opts.realmName || 'realm', model)

      await next()
   }
}
