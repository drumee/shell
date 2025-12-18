const Organization = require("./lib/organization");
const { Mariadb, Cache } = require("@drumee/server-essentials");
const yp = new Mariadb({ name: 'yp', user: process.env.USER, idleTimeout: 60 });
const { exit } = process;
const args = require('./args/user')
Cache.load(yp).then(async () => {
  const org = new Organization({ yp });
  if (ARGV.id) {
    await org.remove({ id: ARGV.id });
  } else {
    let age = ARGV.age || 24 * 60 * 60;
    let res = await yp.await_proc("sandbox.deprecated_domain", age);
    if (!ARGV.yes && !ARGV.age) {
      console.log("Selected domains.")
      console.log(res);
      console.log("issue --yes to actually remove")
      exit(0);
    }
    for (let o of toArray(res)) {
      await org.remove({ name: o.link, id: o.id });
    }
  }
  process.exit(0);
})
