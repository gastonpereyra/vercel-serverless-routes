#!/usr/bin/env node

'use strict';

const RouteBuilder = require('../lib/route-builder');

const [,, ...args] = process.argv;

RouteBuilder.build(args);
