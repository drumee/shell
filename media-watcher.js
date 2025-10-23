const { toArray, Mariadb, Cache, RedisStore, Messenger } = require("@drumee/server-essentials");

// --- SỬA TẠI ĐÂY: Thêm 'host: '127.0.0.1'' ---
// Điều này buộc script kết nối vào CSDL "chính" (primary)
// giống hệt như terminal 'mariadb' của bạn.
const yp = new Mariadb({
  name: 'yp',
  user: process.env.USER,
  idleTimeout: 60,
  autocommit: true,
  host: '127.0.0.1'
});
// --- KẾT THÚC SỬA ---

const { exit } = process;
const args = require('./args/media')


/**
 * Sends a simple notification email.
 * (Hàm sendNotificationEmail vẫn giữ nguyên như cũ)
 */
async function sendNotificationEmail(recipientsArray, subjectText, bodyText) {
  if (!recipientsArray || recipientsArray.length === 0) {
    console.log("    -> No recipients, skipping email send.");
    return;
  }
  console.log(`    Preparing to send email to: ${recipientsArray.join(', ')}`);
  const msg = new Messenger({
    subject: subjectText,
    recipient: recipientsArray,
    handler: (err) => {
      console.error("  MESSENGER PLATFORM ERROR:", err.message);
    }
  });
  const htmlBody = bodyText.replace(/\n/g, '<br>');
  try {
    let { recipient, error } = await msg.send({ html: htmlBody });
    if (error && error.length > 0) {
      console.error(`  ERROR: Failed to send to some addresses:`, error);
    } else {
      console.log(`    -> Email sent successfully to ${recipient.length} recipients.`);
    }
  } catch (e) {
    console.error(`  CRITICAL ERROR calling msg.send:`, e.message);
  }
}

async function main() {
  let res = new RedisStore();
  await res.init();
  let ph = [];
  let sql, data;

  switch (args.command) {

    case "list":
      console.log("Listing 100 unprocessed notification events...");
      data = toArray(await yp.await_proc('push_mfs_events', {}));

      if (data.length === 0) {
        console.log('No new file events.');
      } else {
        console.log(`Found ${data.length} new events:`);
        for (let r of data) {
          console.log(`  - ID: ${r.id}, Hub: ${r.hub_id}, User: ${r.uid}, Action: ${r.event}`);
        }
      }
      break;

    case "update":
      console.log('Starting scan to send file event notifications...');
      // const events = toArray(await yp.await_query(sql));
      const events = toArray(await yp.await_proc('push_mfs_events', {}));
      if (events.length === 0) {
        console.log('No new events to process.');
        break;
      }
      console.log(`Processing ${events.length} events...`);

      for (const event of events) {
        console.log(`---`);
        console.log(`Event ID ${event.id} (Hub: ${event.hub_id}, User: ${event.uid}, Op: ${event.event})`);
        const { db_name } = event;
        let members = await yp.await_proc(`${db_name}.show_all_members`)
        try {
          for (const member of members) {
            console.log("Member-->", member)
          }
          // const users = await yp.await_query(
          //   `SELECT u.id, u.email 
          //    FROM yp.drumate u 
          //    JOIN yp.membership m ON u.id = m.drumate_id
          //    WHERE m.hub_id = ?`,
          //   [event.hub_id]
          // );
          // const recipients = users.filter(user => user.id !== event.uid);
          // if (recipients.length > 0) {
          //   const emailList = recipients.map(user => user.email);
          //   console.log("AAA:97", emailList)
          //   console.log(` -> Found ${emailList.length} recipients (excluding user ${event.uid})`);
          //   const subject = `[Drumee] File Notification: [${event.event}]`;
          //   const body = `Hello,\n\nA file was just [${event.event}] in hub (ID: ${event.hub_id}) by user (ID: ${event.uid}).\n\nRegards,`;
          //   await sendNotificationEmail(emailList, subject, body);
          // } else {
          //   console.log(` -> No recipients (only the triggerer is in the hub).`);
          // }

          // await yp.await_query(
          //   'UPDATE yp.mfs_changelog SET is_notified = TRUE WHERE id = ?',
          //   [event.id]
          // );
          // console.log(` -> Processed and marked ID ${event.id} as is_notified = TRUE.`);
        } catch (jobError) {
          console.error(`  ERROR: Failed to process event ID ${event.id}:`, jobError);
        }
      }
      console.log(`---`);
      console.log('Processing complete.');
      break;

    default:
      console.log(`Command '${args.command}' is not implemented.`);
      break;
  }
}

// Initialize the script
Cache.load(yp)
  .then(main)
  .catch(err => {
    console.error("Critical error during startup or main execution:", err);
  })
  .finally(async () => {
    console.log("Closing database connection...");
    await yp.end();
    exit(0);
  });