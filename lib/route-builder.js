'use strict';

const fs = require('fs');

module.exports = class RouteBuilder {

	// istanbul ignore next
	static get routeFile() {
		return './vercel.json';
	}

	static get pathParam() {
		return /{\w+}/g;
	}

	static get optionsKeys() {
		return {
			'--baseSrc': 'baseSrc',
			'--endpointPrefix': 'endpointPrefix',
			'--routesPath': 'routesPath',
			'--notFound': 'notFound',
			'--index': 'index'
		};
	}

	static get optionsUses() {
		return {
			'--useNotFound': 'useNotFound',
			'--useIndex': 'useIndex'
		};
	}

	static build(args) {

		const options = this.parseArgs(args);
		const routes = this.getRoutes(options).map(route => this.formatRoute(route, options));

		return this.createFile(routes);
	}

	static parseArgs(args = []) {
		return args.reduce((options, arg, index) => {

			if(arg.toString().startsWith('--') && this.optionsUses[arg])
				options[this.optionsUses[arg]] = !this.isFalse(args[index + 1]);

			else if(arg.toString().startsWith('--') && this.optionsKeys[arg])
				options[this.optionsKeys[arg]] = args[index + 1];

			return options;

		}, {
			baseSrc: 'api',
			endpointPrefix: 'api',
			routesPath: 'routes',
			notFound: 'not-found',
			index: 'index',
			useNotFound: true,
			useIndex: true
		});
	}

	static isFalse(value) {
		return ['false', 'no', 'not'].includes(value.toLowerCase());
	}

	static getRoutes({
		routesPath, useIndex, index, useNotFound, notFound, baseSrc
	}) {

		let apiRoutes = [
			// Index Function Definition
			...useIndex ? [{
				src: '/',
				methods: ['GET'],
				dest: `/${baseSrc}/${index}`
			}] : [],
			// Not Found Function Definition
			...useNotFound ? [{
				src: '/.*',
				dest: `/${baseSrc}/${notFound}`
			}] : []
		];

		const path = `${process.cwd()}/${routesPath}`;

		const serviceRoutes = this.getRouteFile(path);

		if(Array.isArray(serviceRoutes))
			apiRoutes = serviceRoutes.concat(apiRoutes);

		return apiRoutes;
	}

	// istanbul ignore next
	static getRouteFile(path) {
		try {
			// eslint-disable-next-line import/no-dynamic-require
			const serviceRoutes = require(path); // eslint-disable-line global-require
			return serviceRoutes;
		} catch(e) {
			console.error('No routes found');
		}
	}

	static formatRoute({ path, method, controller, ...route }, { baseSrc, endpointPrefix }) {

		if(!path && !method)
			return route;


		const { apiEndpoint, apiPathParams, apiControllerPath } = path
			.split('/')
			.filter(Boolean)
			.reduce((customRoute, item) => {

				if(this.pathParam.test(item)) {

					const key = item.replace(/{|}/g, '');

					customRoute.apiEndpoint.push(`(?<${key}>[^/]+)`);
					customRoute.apiPathParams.push(`pathIds.${key}=$${key}`);

				} else {
					customRoute.apiEndpoint.push(item);
					customRoute.apiControllerPath.push(item);
				}

				return customRoute;
			}, {
				apiEndpoint: ['', endpointPrefix],
				apiPathParams: [],
				apiControllerPath: []
			});

		const methodFormatted = (method || 'GET').toLowerCase();
		apiControllerPath.push(methodFormatted);

		const controllerPath = controller || apiControllerPath.join('/');
		const query = `${apiPathParams.length ? `?${apiPathParams.join('&')}` : ''}`;

		return {
			src: apiEndpoint.join('/'),
			methods: [methodFormatted.toUpperCase()],
			dest: `/${baseSrc}/${controllerPath}${query}`
		};
	}

	// istanbul ignore next
	static createFile(routes) {
		return fs.writeFile(this.routeFile, JSON.stringify({
			routes
		}), err => {
			if(err)
				console.error('Cannot make Vercel Route File', err);
		});
	}
};
