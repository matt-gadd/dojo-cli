const globby = require('globby');
const path = require('path');
const yargs = require('yargs');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

const config = {
	depPaths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../'), 'node_modules'],
	folderPrefixes: ['dojo-cli'],
	commandTypes: [
		{ name: 'new', description: 'scaffold' },
		{ name: 'build', description: 'build all the things' },
		{ name: 'template', description: 'get started quickly with a template' }
	]
};

const pluginMap = new Map();

function globs(depPaths, folderPrefixes, commandTypes) {
	const globPaths = [];
	depPaths.forEach((depPath) => {
		folderPrefixes.forEach((folderPrefix) => {
			commandTypes.forEach((commandType) => {
				globPaths.push(path.resolve(depPath, `${folderPrefix}-${commandType.name}-*`));
			});
		});
	});
	return globPaths;
}

globby(globs(config.depPaths, config.folderPrefixes, config.commandTypes)).then((paths) => {
	const commands = paths.map((path) => {
		const command = require(path);
		const pluginParts = /dojo-cli-(.*)-(.*)/.exec(path);
		const pluginType = pluginParts[1];
		const pluginName = pluginParts[2];
		let computedName = pluginName;
		let count = 1;

		while (pluginMap.has(computedName)) {
			computedName = `${pluginName}-${count}`;
			count++;
		}

		pluginMap.set(computedName, command);

		return {
			type: pluginType,
			args: [
				computedName,
				`${command.description} (${path})`,
				command.register,
				command.run
			]
		};
	});

	config.commandTypes.forEach((commandType) => {
		yargs.command(commandType.name, commandType.description, (yargs) => {
			commands
				.filter((command) => command.type === commandType.name)
				.map((command) => yargs.command.apply(null, command.args));
			return yargs;
		});
	});

	yargs.demand(1, 'must provide a valid command')
		.help('h')
		.alias('h', 'help')
		.argv
});
