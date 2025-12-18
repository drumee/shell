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

parser.add_argument("--ident", {
	type: String,
	default: '',
	help: "Domain Ident",
});

parser.add_argument("--owner-email", {
	type: String,
	default: '',
	help: "Organization owner email",
});

parser.add_argument("--firstname", {
	type: String,
	default: 'Bibi',
	help: "Owner firstname",
});

parser.add_argument("--lastname", {
	type: String,
	default: 'Baba',
	help: "Owner lastname",
});

parser.add_argument("--username", {
	type: String,
	default: 'boubou',
	help: "Owner usernam",
});

parser.add_argument("--category", {
	type: String,
	default: 'trial',
	help: "Virtual host name",
});

parser.add_argument("--privilege", {
	type: 'int',
	default: 3,
	help: "Platform privilege",
});


// Define the positional argument
parser.add_argument('command', {
	help: 'Command to execute (list, add, remove, etc.)',
	choices: ['list', 'add', 'remove', 'update'] // optional: restrict to specific commands
});


const args = parser.parse_args();
module.exports = args;
