const { Mariadb, Cache, RedisStore, toArray } = require("@drumee/server-essentials");
const Drumate = require("./lib/drumate");
const Organization = require("./lib/organization");
const { userInfo } = require('os')
const yp = new Mariadb({ name: 'yp', user: process.env.USER, idleTimeout: 60 });
const { exit } = process;
const args = require('./args/organization');
const { owner } = require("@drumee/server-essentials/lib/lex/attribute");

Cache.load(yp).then(async () => {
  let res = new RedisStore();
  await res.init()
  let ph = []
  let sql, data;
  let drumate;
  switch (args.command) {
    case "list":
      sql = `SELECT * FROM domain`;
      data = await yp.await_query(sql);
      for (let r of toArray(data)) {
        let { id, name } = r;
        console.log(`${id}, ${name}`)
      }
      break;
    case "remove":
      break;
    case "add":
    case "create":
      if (userInfo().username != "root") {
        console.log("Require root privilege")
        exit(1)
      }
      const org = new Organization({ yp });
      if (args.ident) {
        let domain = await org.createDomain(args.ident)
        if (domain.error) {
          console.log(domain)
          break
        }
        let res = await org.createWithOwner(domain, args)
        if (owner.error) {
          console.log(res)
          break
        }
        console.log(res)
      } else {
        console.log("Domain ident is required")
      }
      break;
  }
  exit(0);
})
