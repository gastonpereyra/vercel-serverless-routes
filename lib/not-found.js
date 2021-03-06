'use strict';

const { API } = require('vercel-serverless-api');

module.exports = class CannotFoundAPI extends API {

	getStatusCode() {
		return 404;
	}

	process() {
		this.setCode(this.getStatusCode()).setBody({
			message: 'Cannot find API',
			error: this.formatError()
		});
	}

	formatError() {
		return {
			url: this.request.url,
			method: this.request.method
		};
	}
};
