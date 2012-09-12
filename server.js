var http = require('http');
var express = require('express');
var fs = require('fs');
var nvp = require('./lib/nvp.js');
require('nko')('wl9F9Q2B2ii4ltMT');

var app = express.createServer();
nvp.Express.new().init(app);

var server = nvp.Server.new();
server.init(app);

var gameLister = nvp.GameLister.new();
gameLister.init(server);
