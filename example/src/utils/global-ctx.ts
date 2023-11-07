import {AsyncLocalStorage} from 'node:async_hooks';
import type {Context} from "hono";
import Config from "../config";

export const storage = new AsyncLocalStorage()

export function getCtx(): Context {
   return storage.getStore().c as Context
}

export function getModel(name: string) {
   const getCollection = getCtx().get(Config.MongoAtlas.realmName)
   return getCollection(name)
}
