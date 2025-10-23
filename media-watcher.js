const { toArray, Mariadb, Cache, RedisStore, Messenger } = require("@drumee/server-essentials");
const Drumate = require("./lib/drumate");
const { userInfo } = require('os')

const yp = new Mariadb({ 
  name: 'yp', 
  user: process.env.USER, 
  idleTimeout: 60, 
  autocommit: true, 
  host: '127.0.0.1' 
});

const { exit } = process;
const args = require('./args/media')

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

  const spArgs = { pagelength: 100 }; 

  switch (args.command) {
    
    case "list":
      console.log("Listing 100 unprocessed notification events (using SP)...");
      
      let listDataRaw = await yp.await_proc('push_mfs_events', spArgs);
      const listData = toArray(listDataRaw);

      if (listData.length === 0) { 
        console.log('No new file events.');
      } else {
        console.log(`Found ${listData.length} new events:`);
        for (let r of listData) {
          console.log(`  - ID: ${r.id}, Hub: ${r.hub_id}, User: ${r.uid}, DB_Name: ${r.db_name}`);
        }
      }
      break;
    
    case "update":
      console.log('Starting scan to send file event notifications (using SP)...');

      let eventsRaw = await yp.await_proc('push_mfs_events', spArgs);
      const events = toArray(eventsRaw); 


      if (events.length === 0) { 
        console.log('No new events to process.');
        break; 
      }
      console.log(`Processing ${events.length} events...`);

      for (const event of events) {
        console.log(`---`);
        console.log(`Event ID ${event.id} (Hub: ${event.hub_id}, User: ${event.uid}, Op: ${event.event}, DB_Name: ${event.db_name})`);
        const { db_name } = event;

        try {

          let membersRaw = await yp.await_proc(`${db_name}.show_all_members`);
          let members = toArray(membersRaw); 

          const recipients = members.filter(member => member.id !== event.uid); 
          
          if (recipients.length > 0) {
            const emailList = recipients.map(member => member.email); 
            console.log(` -> Found ${emailList.length} recipients (excluding user ${event.uid})`);
            const subject = `[Drumee] File Notification: [${event.event}]`;
            const body = `Hello,\n\nA file was just [${event.event}] in hub (ID: ${event.hub_id}) by user (ID: ${event.uid}).\n\nRegards,`;
            await sendNotificationEmail(emailList, subject, body);
          } else {
            console.log(` -> No recipients found (or only the triggerer is in the hub).`);
          }
          
          await yp.await_query(
            'INSERT INTO yp.push_notification (id, sent) VALUES (?, 1) ON DUPLICATE KEY UPDATE sent = 1',
            [event.id]
          );
          console.log(` -> Processed and marked ID ${event.id} in push_notification table (sent=1).`);

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