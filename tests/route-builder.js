'use strict';

const sinon = require('sinon');

const RouteBuilder = require('../lib/route-builder');

describe('Route Builder API', () => {

	beforeEach(() => {
		sinon.stub(RouteBuilder, 'getRouteFile');
		sinon.stub(RouteBuilder, 'createFile');
	});

	afterEach(() => {
		sinon.restore();
	});

	const vercelNativeRoute = {
		src: '/test',
		methods: ['GET'],
		dest: '/api/test/get'
	};

	const customRouteWithoutMethod = {
		path: '/custom'
	};

	const customRouteWithPathParam = {
		path: '/custom/{id}',
		method: 'post'
	};

	const customRouteWithController = {
		path: '/custom/{id}/controller/{controllerName}',
		method: 'pUt',
		controller: 'controller/redirect'
	};

	const indexRoute = {
		src: '/',
		methods: ['GET'],
		dest: '/api/index'
	};

	const notFoundRoute = {
		src: '/.*',
		dest: '/api/not-found'
	};

	context('When no arguments is passed', () => {

		it('Should create file with only notFound and Index APIs routes', async () => {

			await RouteBuilder.build();

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [indexRoute, notFoundRoute]);
		});

		it('Should create file with a native vercel route', async () => {

			RouteBuilder.getRouteFile.returns([vercelNativeRoute]);

			await RouteBuilder.build();

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [vercelNativeRoute, indexRoute, notFoundRoute]);
		});

		it('Should create file with a custom vercel route', async () => {

			RouteBuilder.getRouteFile.returns([
				customRouteWithoutMethod,
				customRouteWithPathParam,
				customRouteWithController
			]);

			await RouteBuilder.build();

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [
				{
					src: '/api/custom',
					methods: ['GET'],
					dest: '/api/custom/list'
				},
				{
					src: '/api/custom/(?<id>[^/]+)',
					methods: ['POST'],
					dest: '/api/custom/post?pathIds.id=$id'
				},
				{
					src: '/api/custom/(?<id>[^/]+)/controller/(?<controllerName>[^/]+)',
					methods: ['PUT'],
					dest: '/api/controller/redirect?pathIds.id=$id&pathIds.controllerName=$controllerName'
				},
				indexRoute, notFoundRoute
			]);
		});
	});

	context('When customize not-found and index routes', () => {

		it('Should create file empty if not uses either route', async () => {

			await RouteBuilder.build(['--useNotFound', 'false', '--useIndex', 'no']);

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, []);
		});

		it('Should create file if uses custom path for both route', async () => {

			await RouteBuilder.build(['--notFound', 'not-found/get', '--index', 'index/get']);

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [
				{
					src: '/',
					methods: ['GET'],
					dest: '/api/index/get'
				},
				{
					src: '/.*',
					dest: '/api/not-found/get'
				}
			]);
		});
	});

	context('When customize paths', () => {

		it('Should create file if apis source path is change', async () => {

			RouteBuilder.getRouteFile.returns([
				customRouteWithoutMethod,
				customRouteWithPathParam,
				customRouteWithController
			]);

			await RouteBuilder.build(['--baseSrc', 'mySrc']);

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [
				{
					src: '/api/custom',
					methods: ['GET'],
					dest: '/mySrc/custom/list'
				},
				{
					src: '/api/custom/(?<id>[^/]+)',
					methods: ['POST'],
					dest: '/mySrc/custom/post?pathIds.id=$id'
				},
				{
					src: '/api/custom/(?<id>[^/]+)/controller/(?<controllerName>[^/]+)',
					methods: ['PUT'],
					dest: '/mySrc/controller/redirect?pathIds.id=$id&pathIds.controllerName=$controllerName'
				},
				{
					src: '/',
					methods: ['GET'],
					dest: '/mySrc/index'
				},
				{
					src: '/.*',
					dest: '/mySrc/not-found'
				}
			]);
		});

		it('Should create file if endpoint prefix is change', async () => {

			RouteBuilder.getRouteFile.returns([
				customRouteWithoutMethod,
				{
					...customRouteWithPathParam,
					method: 'get'
				},
				customRouteWithController
			]);

			await RouteBuilder.build(['--endpointPrefix', 'logic']);

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [
				{
					src: '/logic/custom',
					methods: ['GET'],
					dest: '/api/custom/list'
				},
				{
					src: '/logic/custom/(?<id>[^/]+)',
					methods: ['GET'],
					dest: '/api/custom/get?pathIds.id=$id'
				},
				{
					src: '/logic/custom/(?<id>[^/]+)/controller/(?<controllerName>[^/]+)',
					methods: ['PUT'],
					dest: '/api/controller/redirect?pathIds.id=$id&pathIds.controllerName=$controllerName'
				},
				{
					src: '/',
					methods: ['GET'],
					dest: '/api/index'
				},
				{
					src: '/.*',
					dest: '/api/not-found'
				}
			]);
		});

		it('Should create file if routes path is change', async () => {

			RouteBuilder.getRouteFile.returns([
				customRouteWithoutMethod,
				customRouteWithPathParam,
				customRouteWithController
			]);

			await RouteBuilder.build(['--routesPath', 'endpoints', '--weird']);

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/endpoints`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [
				{
					src: '/api/custom',
					methods: ['GET'],
					dest: '/api/custom/list'
				},
				{
					src: '/api/custom/(?<id>[^/]+)',
					methods: ['POST'],
					dest: '/api/custom/post?pathIds.id=$id'
				},
				{
					src: '/api/custom/(?<id>[^/]+)/controller/(?<controllerName>[^/]+)',
					methods: ['PUT'],
					dest: '/api/controller/redirect?pathIds.id=$id&pathIds.controllerName=$controllerName'
				},
				indexRoute,
				notFoundRoute
			]);
		});

		it('Should create file if apis source path params identifier changes', async () => {

			RouteBuilder.getRouteFile.returns([
				{
					path: '/custom/:id'
				},
				{
					...customRouteWithController,
					path: '/custom/:id/controller/:controllerName'
				}
			]);

			await RouteBuilder.build(['--pathParamId', ':\\w+']);

			sinon.assert.calledOnceWithExactly(RouteBuilder.getRouteFile, `${process.cwd()}/routes`);
			sinon.assert.calledOnceWithExactly(RouteBuilder.createFile, [
				{
					src: '/api/custom/(?<id>[^/]+)',
					methods: ['GET'],
					dest: '/api/custom/get?pathIds.id=$id'
				},
				{
					src: '/api/custom/(?<id>[^/]+)/controller/(?<controllerName>[^/]+)',
					methods: ['PUT'],
					dest: '/api/controller/redirect?pathIds.id=$id&pathIds.controllerName=$controllerName'
				},
				{
					src: '/',
					methods: ['GET'],
					dest: '/api/index'
				},
				{
					src: '/.*',
					dest: '/api/not-found'
				}
			]);
		});
	});
});
