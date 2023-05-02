# MongoDB Atlas middleware for Hono

A MongoDB Atlas middleware for Hono

## Usage

```ts
// index.ts
import {Hono} from "hono";
import {mongoDBAtlas, IMongoDBAtlasOptions} from '@hono/packages/mongodb-atlas/src/index'

const app = new Hono()
app.use('/', mongoDBAtlas({
   realmAppId: "mongodb-real-app-id-1",
   realmApiKey: "mongodb-real-api-key-1",
   defaultDb: 'test',
   realmName: 'realm01'
}))

app.use('/', mongoDBAtlas({
   realmAppId: "mongodb-real-app-id-2",
   realmApiKey: "mongodb-real-api-key-2",
   defaultDb: 'my-db',
   realmName: 'realm02'
}))

// access collection 'users at default database named 'test'
app.get('/', async (c) => {
   const rs = await c.get('realm01')('users').find()
   // const rs = await c.get(REALM_NAME)('users', 'test').find()
   return c.json(rs)
})

// sugar syntax to access default database
app.get('/sugar-syntax', async (c) => {
   const rs = await c.get('realm01').users.find()
   // const rs = await c.get(REALM_NAME)('users', 'test').find()
   return c.json(rs)
})

// access another database in the same realm
app.get('/db2', async (c) => {
   // access collection 'users' at database 'db2'
   const rs = await c.get('realm01')('users', 'db2').find()
   return c.json(rs)
})

// access another realm database
app.get('/realm2', async (c) => {
   const rs = await c.get('realm02').users.find()
   // const rs = await c.get('realm02')('users', 'my-db').find()
   return c.json(rs)
})


export default app;
```

## Author

Thinh Vu <https://github.com/ThinhVu>

## License

MIT
