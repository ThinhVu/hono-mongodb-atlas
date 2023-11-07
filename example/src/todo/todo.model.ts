import type {ObjectId} from 'bson'

export interface ITodo {
   _id: ObjectId;
   todo: string;
   priority: number;
   completed: boolean;
   createdAt: Date;
}
