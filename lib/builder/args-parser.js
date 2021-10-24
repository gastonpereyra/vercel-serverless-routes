'use strict';

const optionsKeys = {
	'--baseSrc': 'baseSrc',
	'--destFunction': 'destFunction',
	'--routesPath': 'routesPath',
	'--notFound': 'notFound',
	'--index': 'index'
};

const optionsUse = {
	'--useNotFound': 'useNotFound',
	'--useIndex': 'useIndex'
};

const isFalse = value => ['false', 'no', 'not'].includes(value.toLowerCase());

module.exports = args => {

	return args.reduce((options, arg, index) => {

		if(arg.toString().startsWith('--') && optionsUse[arg])
			options[optionsUse[arg]] = !isFalse(args[index + 1]);

		else if(arg.toString().startsWith('--') && optionsKeys[arg])
			options[optionsKeys[arg]] = args[index + 1];

		return options;

	}, {
		baseSrc: 'api',
		destFunction: 'router',
		routesPath: 'routes',
		notFound: 'not-found',
		index: 'index',
		useNotFound: true,
		useIndex: true
	});
};
