'use strict';

const fs = require('fs');
const formatRoutes = require('./builder/format-routes');
const argsParser = require('./builder/args-parser');

const [,, ...args] = process.argv;

const {
	useNotFound, notFound, useIndex, index, ...options
} = argsParser(args);

let apiRoutes = [
	// Index Function Definition
	...useIndex ? [{
		src: '/',
		methods: ['GET'],
		dest: `/${options.baseSrc}/${index}`
	}] : [],
	// Not Found Function Definition
	...useNotFound ? [{
		src: '/.*',
		dest: `/${options.baseSrc}/${notFound}`
	}] : []
];

try {

	const routesPath = `${process.cwd()}/${options.routesPath}`;

	// eslint-disable-next-line import/no-dynamic-require
	const serviceRoutes = require(routesPath); // eslint-disable-line global-require

	if(Array.isArray(serviceRoutes))
		apiRoutes = serviceRoutes.concat(apiRoutes);

} catch(e) {
	console.error('No routes found');
}

const routes = {
	routes: apiRoutes.map(apiRoute => formatRoutes(apiRoute, options))
};

fs.writeFile('./vercel.json', JSON.stringify(routes), err => {
	if(err)
		console.error('Cannot make Vercel Route File', err);
});
