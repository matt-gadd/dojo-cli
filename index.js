const globby = require('globby');
const path = require('path');
const yargs = require('yargs');

const config = {
	depPaths: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
	folderPrefixes: ['dojo-cli-build'],
}

const pluginMap = new Map();

function globs (depPaths, folderPrefixes) {
	const globPaths = [];
	depPaths.forEach((depPath) => {
		folderPrefixes.forEach((folderPrefix) => {
			globPaths.push(path.resolve(depPath, folderPrefix + '-*'));
		});
	});
	return globPaths;
}

globby(globs(config.depPaths, config.folderPrefixes)).then((paths) => {
	const commands = paths.map((path) => {
		const command = require(path);
		const pluginName = command.name || /dojo-cli-.*-(.*)/.exec(path)[1];
		let computedName = pluginName
		let count = 1;
		while (pluginMap.has(computedName)) {
			computedName = `${pluginName}-${count}`;
			count++;
		}
		pluginMap.set(computedName, command);
		return [computedName, `${command.description} (${path})`, command.register, command.run];
	});
	yargs.command("build", "production-ize your app", function(yargs) {
		commands.map((command) => yargs.command.apply(null, command));
		return yargs;
	})
	.demand(1, "must provide a valid command")
	.help("h")
	.alias("h", "help")
	.argv
});
