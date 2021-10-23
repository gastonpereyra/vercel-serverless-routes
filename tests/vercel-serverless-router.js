'use strict';

const assert = require('assert');
// const sandbox = require('sinon');

const vercelServerlessRouter = require('vercel-serverless-router');

describe('vercel-serverless-router', () => {

	context('When Some condition', () => {

		it('Should return something', () => {
			assert(vercelServerlessRouter);
		});
	});

	context('When Other condition', () => {

		it('Should reject other thing', () => {

		});
	});
});
