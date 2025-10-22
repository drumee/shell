const { Mariadb, Cache, RedisStore} = require("@drumee/server-essentials");
const Drumate = require("./lib/drumate");
const { userInfo } = require('os')
const yp = new Mariadb({ name: 'yp', user: process.env.USER, idleTimeout: 60 });
const { exit } = process;
const args = require('./args/media')

Cache.load(yp).then(async () => {
  let res = new RedisStore();
  await res.init()
  let ph = []
  let sql, data;
  switch (args.command) {
    case "list":
      sql = `SELECT * FROM mfs_changelog`;
      data = await yp.await_query(sql, ...ph);
      for (let r of data) {
        console.log(r)
      }
      break;
    default:
      console.log(`Unsupported command ${args.command}`)
      break;
  }
  exit(0);
})
