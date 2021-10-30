'use strict';

const fs = require('fs');

module.exports = class RouteBuilder {

	// istanbul ignore next
	static get routeFile() {
		return './vercel.json';
	}

	static get optionsKeys() {
		return {
			'--baseSrc': 'baseSrc',
			'--endpointPrefix': 'endpointPrefix',
			'--routesPath': 'routesPath',
			'--notFound': 'notFound',
			'--index': 'index',
			'--pathParamId': 'pathParamIdentifier'
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
			useIndex: true,
			pathParamIdentifier: '{\\w+}'
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

	static formatRoute({ path, method, controller, ...route }, { baseSrc, endpointPrefix, pathParamIdentifier }) {

		if(!path && !method)
			return route;

		const pathParam = new RegExp(pathParamIdentifier, 'g');

		const { apiEndpoint, apiPathParams, apiControllerPath } = path
			.split('/')
			.filter(Boolean)
			.reduce((customRoute, item) => {

				if(pathParam.test(item)) {

					const key = item.match(/\w+/g);

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

		const query = `${apiPathParams.length ? `?${apiPathParams.join('&')}` : ''}`;

		const methodFormatted = this.formatMethod(method, apiPathParams.length, apiControllerPath);

		const controllerPath = controller || apiControllerPath.join('/');

		return {
			src: apiEndpoint.join('/'),
			methods: [methodFormatted],
			dest: `/${baseSrc}/${controllerPath}${query}`
		};
	}

	static formatMethod(method, isPathParams, apiControllerPath) {

		if(!isPathParams && (!method || method.toLowerCase() === 'get'))
			apiControllerPath.push('list');
		else
			apiControllerPath.push((method || 'get').toLowerCase());

		return (method || 'get').toUpperCase();
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
