import type { Context, Next } from 'hono'
import * as Realm from 'realm-web'

import RealmServices = globalThis.Realm.Services
import MongoDB = RealmServices.MongoDB

type MongoDBDatabase = RealmServices.MongoDBDatabase
type Document = MongoDB.Document

let App: Realm.App
let user
let client: MongoDB

export const KEYS = {
   APP: 'mongodb-atlas-app',
   USER: 'mongodb-atlas-user',
   CLIENT: 'mongodb-atlas-client',
}

export interface IMongoDBAtlasOptions {
   realmAppId: string;
   realmApiKey: string;
   defaultDb: string;
   realmName: string; // an identifier for this realm instance
}

export function mongoDBAtlas(options: IMongoDBAtlasOptions) {
   if (!options.realmAppId || !options.realmApiKey)
      throw new Error('Missing Realm App ID or API Key')

   return async function(c: Context, next: Next) {
      if (App) {
         await next()
         return
      }

      App = App || new Realm.App(options.realmAppId)
      user = await App.logIn(Realm.Credentials.apiKey(options.realmApiKey))
      client = user.mongoClient('mongodb-atlas')

      // for one who want to inspect raw components
      c.set(`${options.realmName}-${KEYS.APP}`, App)
      c.set(`${options.realmName}-${KEYS.USER}`, user)
      c.set(`${options.realmName}-${KEYS.CLIENT}`, client)

      const dbCache: Record<string, MongoDBDatabase> = {}
      function getDb(name: string): MongoDBDatabase {
         if (!dbCache[name])
            dbCache[name] = client.db(name)
         return dbCache[name]
      }

      const collectionCache: Record<string, MongoDB.MongoDBCollection<Document>> = {}
      function getCollection<T extends Document>(collectionName: string, dbName = options.defaultDb): MongoDB.MongoDBCollection<T> {
         const key = `${dbName}--${collectionName}`
         if (!collectionCache[key])
            collectionCache[key] = getDb(dbName).collection(collectionName)
         return collectionCache[key] as MongoDB.MongoDBCollection<T>
      }

      // proxy for default db access
      const model = new Proxy(getCollection, {
         get: (__, collName) => getCollection(collName.toString())
      })

      c.set(options.realmName || 'realm', model)

      await next()
   }
}
