const argparse = require("argparse");

const parser = new argparse.ArgumentParser({
	description: "Drumee Domain Management",
	add_help: true,
});

parser.add_argument("--id", {
	type: "int",
	default: 0,
	help: "Domain ID to remove",
});

parser.add_argument("--age", {
	type: "int",
	default: 0,
	help: "Max age in seconds for deprecated domains (default: 86400)",
});

parser.add_argument("--yes", {
	action: "store_true",
	default: false,
	help: "Confirm removal of deprecated domains",
});

const args = parser.parse_args();
module.exports = args;
