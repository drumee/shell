const { Mariadb, Cache, toArray } = require("@drumee/server-essentials");
const Organization = require('../lib/organization');
const yp = new Mariadb({ name: 'yp', user: process.env.USER, idleTimeout: 60 });
const { exit } = process;
const args = require('../args/domain');

Cache.load(yp).then(async () => {
  const org = new Organization();
  if (args.id) {
    await org.remove(args.id);
  } else {
    const age = args.age || 24 * 60 * 60;
    const res = await yp.await_proc("sandbox.deprecated_domain", age);
    if (!args.yes && !args.age) {
      console.log("Selected domains.");
      console.log(res);
      console.log("Issue --yes to actually remove");
      exit(0);
    }
    for (let o of toArray(res)) {
      await org.remove(o.id);
    }
  }
  process.exit(0);
});
