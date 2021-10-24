'use strict';

const sinon = require('sinon');
const { API } = require('vercel-serverless-api');

const { Router } = require('../lib');
const Response = require('./resources/response');

describe('Router', () => {

	let response = new Response();

	beforeEach(() => {

		response = new Response();

		sinon.spy(response, 'status');
		sinon.spy(response, 'json');
		sinon.stub(Router, 'getController');
	});

	afterEach(() => {
		sinon.restore();
	});

	const request = {
		url: '/api/test',
		method: 'GET'
	};

	context('When cannot link to the API Controller', () => {

		it('Should set status code 502 if Controller Path is not send', async () => {

			await Router.link(request, response);

			sinon.assert.calledOnceWithExactly(response.status, 502);
			sinon.assert.calledOnceWithExactly(response.json, {
				message: 'Cannot connect with API',
				error: 'Route is invalid'
			});

			sinon.assert.notCalled(Router.getController);
		});

		it('Should set status code 502 if cannot found file', async () => {

			Router.getController.throws();

			await Router.link({
				...request,
				query: { apiControllerPath: 'test' }
			}, response);

			sinon.assert.calledOnceWithExactly(response.status, 502);
			sinon.assert.calledOnceWithExactly(response.json, {
				message: 'Cannot connect with API',
				error: 'Cannot find function'
			});

			sinon.assert.calledOnceWithExactly(Router.getController, `${process.cwd()}/src/apis/test/get`);
		});
	});

	context('When can link to the API Controller', () => {

		class TestApi extends API {

			process() {

				if(Object.keys(this.pathIds).length)
					return this.setBody(this.pathIds);

				if(Object.keys(this.filters).length)
					return this.setBody(this.filters);

			}
		}

		it('Should set status code 200 without queries or pathParams', async () => {

			Router.getController.returns(TestApi);

			await Router.link({
				...request,
				query: { apiControllerPath: 'test' }
			}, response);

			sinon.assert.calledOnceWithExactly(response.status, 200);
			sinon.assert.calledOnceWithExactly(response.json, {});

			sinon.assert.calledOnceWithExactly(Router.getController, `${process.cwd()}/src/apis/test/get`);
		});

		it('Should set status code 200 with pathParams', async () => {

			Router.getController.returns(TestApi);

			await Router.link({
				...request,
				query: { apiControllerPath: 'test', 'pathIds.id': '1' }
			}, response);

			sinon.assert.calledOnceWithExactly(response.status, 200);
			sinon.assert.calledOnceWithExactly(response.json, {
				id: '1'
			});

			sinon.assert.calledOnceWithExactly(Router.getController, `${process.cwd()}/src/apis/test/get`);
		});

		it('Should set status code 200 with queries', async () => {

			Router.getController.returns(TestApi);

			await Router.link({
				...request,
				query: { apiControllerPath: 'test', id: '10' }
			}, response);

			sinon.assert.calledOnceWithExactly(response.status, 200);
			sinon.assert.calledOnceWithExactly(response.json, {
				id: '10'
			});

			sinon.assert.calledOnceWithExactly(Router.getController, `${process.cwd()}/src/apis/test/get`);
		});

		it('Should set status code 200 with custom controller', async () => {

			Router.getController.returns(TestApi);

			await Router.link({
				...request,
				query: { apiControllerPath: '/public/test/base', isCustomController: 'true' }
			}, response);

			sinon.assert.calledOnceWithExactly(response.status, 200);
			sinon.assert.calledOnceWithExactly(response.json, {});

			sinon.assert.calledOnceWithExactly(Router.getController, `${process.cwd()}/public/test/base`);
		});
	});
});
