/**
 * Configuration file
 *
 */

var config = {};

config.memcache = {};
config.database = {};

config.listenPort = 8080;

config.memcache.host = '192.168.0.77';
config.memcache.port = 11211;

config.database.filename = 'db';

module.exports = config;