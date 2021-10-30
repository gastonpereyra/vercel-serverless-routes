'use strict';

const { handler } = require('vercel-serverless-api');
const VercelServerlessApiTests = require('vercel-serverless-tests');

const { IndexAPI } = require('../lib');

const { defaultTemplate, customTemplate } = require('./resources/index-api-templates');

describe('Cannot Found API', () => {

	afterEach(() => {
		VercelServerlessApiTests.sinon.restore();
	});

	context('When it used the default API', () => {

		const ApiHandler = (...args) => handler(IndexAPI, ...args);
		const ApiTest = new VercelServerlessApiTests(ApiHandler);

		ApiTest.itTest({
			description: 'Should return status code 200 with default template',
			request: {
				url: '/',
				method: 'GET'
			},
			response: {
				status: 200,
				body: defaultTemplate
			},
			before: sinon => sinon.useFakeTimers(new Date(2021, 1, 1, 0, 0))
		});
	});

	context('When it used a custom API', () => {

		class CustomAPI extends IndexAPI {

			static get githubUser() {
				return {
					projectName: 'vercel-test',
					user: 'gastonpereyra',
					owner: 'Gastón Pereyra'
				};
			}

			static get colors() {
				return {
					brand: '303031',
					hover: '303031',
					background: '303031',
					disclaimer: '303031',
					footerLine: '303031'
				};
			}

			static get messages() {
				return {
					banner: 'https://image.png',
					location: 'Buenos Aires',
					finalMessage: 'Test it!'
				};
			}
		}

		const ApiHandler = (...args) => handler(CustomAPI, ...args);
		const ApiTest = new VercelServerlessApiTests(ApiHandler);

		ApiTest.itTest({
			description: 'Should return status code 200 with custom template',
			request: {
				url: '/',
				method: 'GET'
			},
			response: {
				status: 200,
				body: customTemplate
			},
			before: sinon => sinon.useFakeTimers(new Date(2021, 1, 1, 0, 0))
		});
	});
});
