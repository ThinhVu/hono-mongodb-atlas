import {Hono} from "hono";
import Config from "./config";
import {mongoDBAtlas} from '../../src';
import TodoController from "./todo/todo.controller";

const app = new Hono();

app.use('*', mongoDBAtlas(Config.MongoAtlas))
app.get('/', async (c) => {
   // @ts-ignore
   const rs = await c.get('r01').users.findOne()
   return c.json(rs)
})
app.route('/todos', TodoController)

export default app;
