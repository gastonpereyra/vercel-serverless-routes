'use strict';

const { handler } = require('vercel-serverless-api');

module.exports = class Router {

	/**
	 * Return the folder where the API controllers are stored.
	 * @returns {string} Default: 'apis/'
	 */
	static get apiPath() {
		return '/src/apis/';
	}

	/**
	 * Link the request to the API controllers and execute it
	 * @param {Object} request Vercel request object
	 * @param {Object} response Vercel response object
	 */
	static async link({ query = {}, method, ...request }, response) {

		const { apiControllerPath, isCustomController = false, ...queries } = query;

		if(!apiControllerPath) {
			response
				.status(502)
				.json({
					message: 'Cannot connect with API',
					error: 'Route is invalid'
				});
			return;
		}

		const controllerPath = {
			path: apiControllerPath,
			method,
			isCustom: isCustomController
		};

		try {

			const path = this.formatControllerPath(controllerPath);
			const API = this.getController(path);
			return handler(API, { ...request, method, query: queries }, response);

		} catch(e) {

			response
				.status(502)
				.json({
					message: 'Cannot connect with API',
					error: 'Cannot find function'
				});
		}
	}

	/* istanbul ignore next */
	static getController(path) {
		// eslint-disable-next-line import/no-dynamic-require
		const API = require(path); // eslint-disable-line global-require
		return API;
	}

	static formatControllerPath({ path, method, isCustom }) {

		const base = isCustom ? '' : this.apiPath;
		const controllerPath = isCustom ? path : `${path}/${method.toLowerCase()}`;

		return `${process.cwd()}${base}${controllerPath}`;
	}
};
