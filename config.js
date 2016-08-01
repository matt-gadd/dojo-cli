const path = require('path');

module.exports = {
	searchPaths: [
		path.resolve(__dirname, 'node_modules'),
		path.resolve(__dirname, '../'),
		'node_modules'
	],
	searchPrefixes: ['dojo-cli'],
	commandTypes: [
		{ name: 'new', description: 'scaffold' },
		{ name: 'build', description: 'build all the things' },
		{ name: 'template', description: 'get started quickly with a template' }
	]
}
