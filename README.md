# Vercel Serverless Routes :traffic_light:

## Code Quality Status
![Build Status](https://github.com/gastonpereyra/vercel-serverless-routes/workflows/Build%20Status/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/gastonpereyra/vercel-serverless-routes/badge.svg?branch=master)](https://coveralls.io/github/gastonpereyra/vercel-serverless-routes?branch=master)

![vercel-serverless-routes Banner](https://user-images.githubusercontent.com/39351850/138572556-02d484e3-062a-42ae-a98f-f2d17a9a99ea.png)

## Description :clipboard:
A helper to build Vercel routes `vercel.json` from another folder and files, and other nomenclature.

Also it provides some custom functions to use as defaults in some projects, such as:

- When the endpoint is wrong and the API doesn't exists, and throw a custom message. See [Cannot Found API](#Not-Found-Api)
- When the project is only APIs, and no fronted, and API that render a nice index page if the user only access to the base URL. See [Index API](#Index-Api)

This two "APIs" I use as defaults in my Vercel projects, so i decided to make a generic ones and do not repeated it everywhere, you can use it.
### Why? :grey_question:

When multiples endpoints/API are being added to `vercel.json` file, it makes too long to be read and it is not easy to find the right one or organize, or add a new one. So I need to split it in several files to group them by some relationship.

Also, if the endpoint needs to have a path param for routing REGEX must be used, and pass it through query params to the handler. BORING!.

So i decided to generate this package to split the routes into multiple `.js` or `.json` files, and having and alternative to define the APIs endpoints and handlers, to make easier use path params.

### Synergy :zap:

This package is created to use it with the following packages:

- [Vercel](https://www.npmjs.com/package/vercel)
- [Vercel-Serverless-Api](https://www.npmjs.com/package/vercel-serverless-api)
- [Vercel-Serverless-Tests](https://www.npmjs.com/package/vercel-serverless-tests)

## Building routes :hammer:

You must run in your terminal, in the root folder of your project:

```bash
npx vercel-serverless-routes
```

This will create a `vercel.json` file with the routes.

### Recommendation :bulb:

For building routes it must executes before deploying to Vercel, in most cases before pushing the branch into repository, and in local env before running the CLI.

So, you can add to your `package.json`:

```json
"scripts": {
    ...,
    "build-routes": "npx vercel-serverless-routes",
    "dev": "npm run build-routes; vercel dev",
  }
```

### Defining an endpoint

Every endpoint for every route will be added to the base URL of your vercel project:

- `https://your-project-name.vercel.app/ENDPOINT`

#### Vercel Native
If you use the vercel nomenclature, it will be valid and any changes will be reflected in the `vercel.json` file.

<details>

```json
{
    "src": "/example/native", // The API ENDPOINT
    "methods": ["GET", "POST"], // The methods allowed
    "dest": "/api/example" // The relative path to the function handler
}
```

> There a lot more options. See Vercel docs.


It makes you create this URL

- `GET/ https://your-project-name.vercel.app/example/native`
- `POST/ https://your-project-name.vercel.app/example/native`

And uses a function handler in: `./root/api/example`

> __REMEMBER__: The handlers are recommended to be in `./root/api/*` folder.

</details>

#### New Alternative

But you can use my alternative:

- `path`: The endpoint path. _STRING_. __REQUIRED__
    - Must start with `'/'`.
    - Path Params can be defined with `'{SOME_NAME}'`.
    - A prefix will be added: `/api/`.
- `method`: The HTTP Method. _STRING_. __OPTIONAL FOR GET__
    - If nothing is passed, be default it will be a `GET` request.
    - Despite Vercel can handle multiple ones, with this form it define individually, this is to have individual functions for each API.
- `controller`: A custom path to the API function handler. _STRING_. __OPTIONAL__
    - Must NOT start with `'/'`.
    - A prefix will be added: `/api/`.

> Using this fields it will generate a path to the function handler into `./root/api/` folder.

<details>

**Example 1**

```json
[
    {
        "path": "/example/{id}",
        "methods": "POST"
    }
]
```

It makes you create this URL:

- `POST/ https://your-project-name.vercel.app/api/example/1`
- `POST/ https://your-project-name.vercel.app/api/example/617d89e0eb5815550438e57c`
- ETC..

And uses a function handler in: `./root/api/example/get?pathIds.id=$id`

**Example 2**

```json
[
    {
        "path": "/example"
    }
]
```

It makes you create this URL:

- `GET/ https://your-project-name.vercel.app/api/example`

And uses a function handler in: `./root/api/example/list`

**Example 3**

```json
[
    {
        "path": "/example/{id}/custom/{customId}"
    }
]
```

It makes you create this URL:

- `GET/ https://your-project-name.vercel.app/api/example/1/custom/2`
- ETC...

And uses a function handler in: `./root/api/example/get?pathIds.id=$id&pathIds.customId=$customId`

**Example 4**

```json
[
    {
        "path": "/example/custom/{customId}",
        "method": "delete",
        "controller": "example-delete"
    }
]
```

It makes you create this URL:

- `GET/ https://your-project-name.vercel.app/api/example/custom/2`
- ETC...

And uses a function handler in: `./root/api/example-delete?pathIds.customId=$customId`

</details>

#### Customize

- `--endpointPrefix`: to change the prefix in endpoint.
    - Default is `api`.
- `--baseSrc`: to change the base path of the function handler.
    - Default is `api`.
    - **NOT RECOMMENDED TO CHANGE**.
- `--pathParamId`: to change the path parameters identifier.
    - Default is `{\w+}`.
    - It will be use with Regex. Be careful.

<details>

**Example**

```bash
npx vercel-serverless-routes --baseSrc src --endpointPrefix my-api --pathParamId :id
```

```json
[
    {
        "path": "/example/:id/custom/:customId"
    }
]
```

It makes you create this URL:

- `GET/ https://your-project-name.vercel.app/my-api/example/1/custom/2`
- ETC...

And uses a function handler in: `./root/src/example/get?pathIds.id=$id&pathIds.customId=$customId`

<details>

### Routes files

The new files must be in `./root/routes/index.js`, it must export an array of objects.

```js
// in ./root/routes/index.js
'use strict';

const exampleFunctions = require('./example.json');
const customFunctions = require('./custom.js');

module.exports = [
    ...exampleFunctions,
    ...customFunctions
];
```

#### Customize

- `--routesPath`: to change the folder of the routes file.
    - Default is `routes`.

**Example**

```bash
npx vercel-serverless-routes --routesPath endpoints
```

The files must be in `./root/endpoints/index.js`

### Extra API

To use it must install the package in your project:

```bash
npm install vercel-serverless-routes
```
#### Not Use It

Both API can be deactivated using

```bash
npx vercel-serverless-routes --useNotFound false --useIndex false
```

#### Change file

Also your files can be relocated.

```bash
npx vercel-serverless-routes --index extra/index --notFound extra/not-found
```

> By default it are located in `./root/api/index.js` and `./root/api/not-found.js`

#### Not Found Api

It is an API that matches any endpoint that is not found (`/.*`) and returns

* statusCode: `404`
* body: `{ message: 'Cannot find API', error: { url, method } }`

<details>

**Example 1**

```js
const { handler } = require('vercel-serverless-api');
const { CannotFoundAPI } = require('vercel-serverless-routes');

module.exports = (...args) => handler(CannotFoundAPI, ...args);

```

**Example 2**

```js
const { handler } = require('vercel-serverless-api');
const { CannotFoundAPI } = require('vercel-serverless-routes');

class CustomNotFound extends CannotFoundAPI {

    getStatusCode() {
		return 402;
	}

    formatError() {
		return {
			suggestion: 'Check the documentation'
		};
	}
}

module.exports = (...args) => handler(CustomNotFound, ...args);

```

</details>

#### Index Api

The API have an [Template]('./docs/template.html') already set up, and have default values, you can see the results examples [here](./docs/example.html).

But you can change the default values. See Example 2.

<details>

**Example 1**

```js
const { handler } = require('vercel-serverless-api');
const { IndexAPI } = require('vercel-serverless-routes');

module.exports = (...args) => handler(IndexAPI, ...args);
```

**Example 2**

```js
const { handler } = require('vercel-serverless-api');
const { IndexAPI } = require('vercel-serverless-routes');

class CustomIndex extends IndexAPI {

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
        }
    }
}

module.exports = (...args) => handler(CustomIndex, ...args);
```

</details>

## Bug :bug:

[Report Here](https://github.com/gastonpereyra/vercel-serverless-routes/issues/new?assignees=gastonpereyra&labels=bug&template=bug.md&title=[BUG])

## Idea :bulb:

[Tell me](https://github.com/gastonpereyra/vercel-serverless-routes/issues/new?assignees=gastonpereyra&labels=enhancement&title=%5BIDEA%5D+-)
