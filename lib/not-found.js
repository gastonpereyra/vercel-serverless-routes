'use strict';

const { API } = require('vercel-serverless-api');

module.exports = class CannotFoundAPI extends API {

	process() {
		this.setCode(404).setBody({
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
