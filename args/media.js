const argparse = require("argparse");

const parser = new argparse.ArgumentParser({
	description: "Drumee Media Watcher ",
	add_help: true,
});


// parser.add_argument("--domain", {
// 	type: String,
// 	default: '',
// 	help: "Domain Name",
// });



// Define the positional argument
parser.add_argument('command', {
  help: 'Command to execute (list, add, remove, etc.)',
  choices: ['list', 'add', 'remove', 'update'] // optional: restrict to specific commands
});


const args = parser.parse_args();
module.exports = args;
