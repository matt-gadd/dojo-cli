const globby = require('globby');
const path = require('path');
const yargs = require('yargs');

const config = {
	depPaths: ['node_modules'],
	folderPrefixes: ['dojo-cli-command', 'dojo-cli-template'],
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
	paths.map((path) => {
		const command = require(path);
		const pluginName = command.name || /dojo-cli-.*-(.*)/.exec(path)[1];
		let computedName = pluginName
		let count = 1;
		while (pluginMap.has(computedName)) {
			computedName = `${pluginName}-${count}`;
			count++;
		}
		pluginMap.set(computedName, command);
		yargs.command(
			computedName,
			command.description,
			command.register,
			command.run
		);
	});
	yargs.help()
		.argv
});
