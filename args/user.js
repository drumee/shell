const argparse = require("argparse");

const parser = new argparse.ArgumentParser({
	description: "Drumee Shell ",
	add_help: true,
});

parser.add_argument("--domain-id", {
	type: "int",
	default: 1,
	help: "Domain Id, defaulted to 1",
});

parser.add_argument("--domain", {
	type: String,
	default: '',
	help: "Domain Name",
});

parser.add_argument("--category", {
	type: String,
	default: '',
	help: "Use category",
});

parser.add_argument("--email", {
	type: String,
	default: '',
	help: "Email",
});

parser.add_argument("--firstname", {
	type: String,
	default: '',
	help: "firstname",
});

parser.add_argument("--lastname", {
	type: String,
	default: '',
	help: "lastname",
});

parser.add_argument("--password", {
	type: String,
	default: '',
	help: "password",
});

parser.add_argument("--lang", {
	type: String,
	default: 'en',
	help: "Uer language",
});

parser.add_argument("--vhost", {
	type: String,
	default: '',
	help: "Virtual host name",
});


// Define the positional argument
parser.add_argument('command', {
  help: 'Command to execute (list, add, remove, etc.)',
  choices: ['list', 'add', 'remove', 'update'] // optional: restrict to specific commands
});


const args = parser.parse_args();
module.exports = args;
