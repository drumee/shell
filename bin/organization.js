const { Mariadb, Cache, RedisStore, toArray } = require("@drumee/server-essentials");
const Organization = require('../lib/organization');
const { userInfo } = require('os');
const yp = new Mariadb({ name: 'yp', user: process.env.USER, idleTimeout: 60 });
const { exit } = process;
const args = require('../args/organization');

Cache.load(yp).then(async () => {
  let res = new RedisStore();
  await res.init();
  switch (args.command) {
    case "list": {
      const data = await yp.await_query(`SELECT * FROM domain`);
      for (let r of toArray(data)) {
        console.log(`${r.id}, ${r.name}`);
      }
      break;
    }
    case "remove": {
      if (!args.domain_id) {
        console.log("Domain id is required (--domain-id)");
        break;
      }
      const org = new Organization(args);
      await org.remove(args.domain_id);
      console.log(`Organization ${args.domain_id} removed`);
      break;
    }
    case "add":
    case "create": {
      if (userInfo().username != "root") {
        console.log("Require root privilege");
        exit(1);
      }
      if (!args.owner_email) {
        console.log("Owner email is required (--owner-email)");
        break;
      }
      const org = new Organization();
      const domain = await org.createDomain();
      if (!domain || domain.error) {
        console.log("Failed to create domain", domain);
        break;
      }
      const result = await org.createOwner(domain, args);
      if (!result) {
        console.log("Failed to create organization");
        break;
      }
      console.log(result);
      break;
    }
  }
  exit(0);
});
