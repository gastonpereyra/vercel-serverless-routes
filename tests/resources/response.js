'use strict';

module.exports = class Response {

	status(statusCode) {
		this.statusCode = statusCode;
		return this;
	}

	json(value) {
		this.body = value;
		return this;
	}
};
