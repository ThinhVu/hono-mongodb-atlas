import {getModel} from "../utils/global-ctx";
import type {ITodo} from './todo.model';
import type {ObjectId} from "bson";

export async function create(todo: Partial<ITodo>) : Promise<ITodo> {
   return getModel('todo').insertOne(todo)
}

export async function read(_id: ObjectId | string) : Promise<ITodo> {
   return getModel('todo').findOne({_id});
}

export async function update(_id: ObjectId | string, todo: Partial<ITodo>) : Promise<ITodo> {
   return getModel('todo').updateOne({_id}, todo);
}

export async function remove(_id: ObjectId | string) : Promise<any> {
   return getModel('todo').deleteOne({_id});
}
