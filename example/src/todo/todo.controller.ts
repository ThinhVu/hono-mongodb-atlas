import {Hono} from 'hono';
import safeCall from "../middleware/safe-call";
import {create, read, remove, update} from "./todo.logic";
import type {ITodo} from "./todo.model";

const route = new Hono();

route.post('/', safeCall(async (ctx) => create(await ctx.req.json() as Partial<ITodo>)))
// @ts-ignore
route.get('/:id', safeCall(async (ctx) => read(ctx.req.param('id'))))
// @ts-ignore
route.put('/:id', safeCall(async (ctx) => update(ctx.req.param('id'), await ctx.req.json() as Partial<ITodo>)))
// @ts-ignore
route.delete('/:id', safeCall(async (ctx) => remove(ctx.req.param('id'))))

export default route;
