'use strict';

const { handler } = require('vercel-serverless-api');
const VercelServerlessApiTests = require('vercel-serverless-tests');

const { CannotFoundAPI } = require('../lib');

describe('Cannot Found API', () => {

	afterEach(() => {
		VercelServerlessApiTests.sinon.restore();
	});

	context('When it used the default API', () => {

		const ApiHandler = (...args) => handler(CannotFoundAPI, ...args);
		const ApiTest = new VercelServerlessApiTests(ApiHandler);

		ApiTest.itTest({
			description: 'Should return status code 404 with default message',
			request: {
				url: 'api/test',
				method: 'POST'
			},
			response: {
				status: 404,
				body: {
					message: 'Cannot find API',
					error: {
						url: 'api/test',
						method: 'POST'
					}
				}
			}
		});
	});

	context('When it used a custom API', () => {

		class CustomAPI extends CannotFoundAPI {
			formatError() {
				return 'custom message';
			}
		}

		const ApiHandler = (...args) => handler(CustomAPI, ...args);
		const ApiTest = new VercelServerlessApiTests(ApiHandler);

		ApiTest.itTest({
			description: 'Should return status code 404 with default message',
			request: {
				url: 'api/test',
				method: 'POST'
			},
			response: {
				status: 404,
				body: {
					message: 'Cannot find API',
					error: 'custom message'
				}
			}
		});
	});
});
