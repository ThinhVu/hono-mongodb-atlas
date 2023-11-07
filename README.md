# MongoDB Atlas middleware for Hono

A MongoDB Atlas middleware for Hono

## Basic Usage

```ts
// index.ts
import {Hono} from "hono";
import {mongoDBAtlas} from 'hono-mongodb-atlas'

const app = new Hono()
// connect to 1st mongo atlas
app.use('/', mongoDBAtlas({
   realmAppId: "mongodb-real-app-id-1",
   realmApiKey: "mongodb-real-api-key-1",
   defaultDb: 'test',
   realmName: 'realm01'
}))
// and you can connect to another mongo atlas too
app.use('/', mongoDBAtlas({
   realmAppId: "mongodb-real-app-id-2",
   realmApiKey: "mongodb-real-api-key-2",
   defaultDb: 'my-db',
   realmName: 'realm02'
}))

// usage syntax
// Full: 
//   await c.get(REALM_NAME)(COLL_NAME).find()
// Use defaultDb:
//   await c.get(REALM_NAME)(COLL_NAME).find()
// Use sugar-syntax:
//  await c.get(REALM_NAME).COLL_NAME.find()

app.get('/', async (c) => {
   // access collection 'users' at default database named 'test'
   // of atlas instance 'realm01'
   const rs1 = await c.get('realm01')('users', 'test').find()
   const rs2 = await c.get('realm01')('users').find()
   const rs3 = await c.get('realm01').users.find()
   return c.json([rs1, rs2, rs3])
})

// in case you want to access another db rather than the default one
// then you need to pass db name as an example below
app.get('/db2', async (c) => {
   // access collection 'users' at database 'db2'
   const rs = await c.get('realm01')('users', 'db2').find()
   return c.json(rs)
})

// in case you want to access another realm
app.get('/realm2', async (c) => {
   const rs = await c.get('realm02').users.find()
   // const rs = await c.get('realm02')('users', 'my-db').find()
   return c.json(rs)
})

export default app;
```

### Advanced usage (Using AsyncLocalStorage)
The code below is used for a quick look. For complete example, see /example.

```ts
// 1. Define storage
const storage = new AsyncLocalStorage()

// 2. define middleware
function $(handleRoute)  {
    return async (c: Context) : Promise<any> => {
        try {
            const rs = await storage.run(c, () => handleRoute(c))
            return c.json({data: rs})
        } catch(e) {
            handleApiError(e, c);
        }
    }
}

// 3. using it as similar as Mongoose
// todo.model.ts
interface ITodo {
    _id: ObjectId;
    todo: string;
    priority: number;
    completed: boolean;
    createdAt: Date;
}

// Model fn
const Model = (name: string) => storage.getStore().get('realm01')(name)

// todo.logic.ts
const createTodo = todo => Model('todo').insertOne(todo)
const readTodo = _id => Model('todo').findOne({_id})
const updateTodo = (_id, todo) => Model('todo').updateOne({_id}, todo)
const removeTodo = _id => Model('todo').deleteOne({_id})

// todo.controller.ts
const route = new Hono();
route.post('/', $(async ctx => createTodo(await ctx.req.json() as Partial<ITodo>)))
route.get('/:id', $(async ctx => readTodo(ctx.req.param('id'))))
route.put('/:id', $(async ctx => updateTodo(ctx.req.param('id'), await ctx.req.json() as Partial<ITodo>)))
route.delete('/:id', $(async ctx => removeTodo(ctx.req.param('id'))))
```

## Author

Thinh Vu <https://github.com/ThinhVu>

## TODO
- fix warning at `c.get('realn-name')`

## License

MIT
