'use strict';

module.exports = ({ path, method, controller, ...route }, { baseSrc, destFunction }) => {

	if(!path && !method)
		return route;

	const { apiEndpoint, apiPathParams, apiControllerPath } = path
		.split('/')
		.filter(Boolean)
		.reduce((customRoute, item) => {

			if(/{\w+}/g.test(item)) {

				const key = item.replace(/{|}/g, '');

				customRoute.apiEndpoint.push(`(?<${key}>[^/]+)`);
				customRoute.apiPathParams.push(`pathIds.${key}=$${key}`);

			} else {
				customRoute.apiEndpoint.push(item);
				customRoute.apiControllerPath.push(item);
			}

			return customRoute;
		}, {
			apiEndpoint: ['', baseSrc],
			apiPathParams: [],
			apiControllerPath: []
		});

	const controllerPath = controller ? `apiControllerPath=${controller}&isCustomController=true` : `apiControllerPath=${apiControllerPath.join('/')}`;
	const query = `${controllerPath}${apiPathParams.length ? `&${apiPathParams.join('&')}` : ''}`;

	return {
		src: apiEndpoint.join('/'),
		methods: [(method || 'GET').toUpperCase()],
		dest: `/${baseSrc}/${destFunction}?${query}`
	};
};
