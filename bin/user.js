const { Mariadb, Cache, RedisStore } = require("@drumee/server-essentials");
const Drumate = require('../lib/drumate');
const { userInfo } = require('os');
const yp = new Mariadb({ name: 'yp', user: process.env.USER, idleTimeout: 60 });
const { exit } = process;
const args = require('../args/user');

Cache.load(yp).then(async () => {
  let res = new RedisStore();
  await res.init();
  let ph = [];
  let sql, data;
  let drumate;
  switch (args.command) {
    case "list":
      sql = `SELECT id, email, fullname, profile FROM drumate WHERE`;
      if (args.category) {
        ph = [args.category];
        sql = `${sql} JSON_VALUE(profile, "$.category") = ?`;
      } else if (args.email) {
        ph = [args.email];
        sql = `${sql} email LIKE ?`;
      }
      data = await yp.await_query(sql, ...ph);
      for (let r of data) {
        let { id, email, fullname, profile } = r;
        let { category } = profile;
        console.log(`${id}, ${email}, ${fullname}, ${category}`);
      }
      break;
    case "remove":
      if (userInfo().username != "root") {
        console.log("Require root privilege");
        exit(1);
      }
      drumate = new Drumate({ yp });
      if (args.email) {
        console.log(`Removing user ${args.email}`);
        await drumate.remove(args);
      } else {
        console.log("Email is required");
      }
      break;
    case "add":
      drumate = new Drumate({ yp });
      if (args.email) {
        let result = await drumate.create(args);
        if (result.error) {
          console.log("Failed to create user", result);
        } else {
          console.log("User created", result);
        }
      } else {
        console.log("Email is required");
      }
      break;
  }
  exit(0);
});
