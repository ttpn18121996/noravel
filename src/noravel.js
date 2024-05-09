const createApplication = require('./Foundation/Application');

exports = module.exports = createApplication;

exports.config = require('./Foundation/Config');
exports.ServiceProvider = require('./Foundation/Providers/ServiceProvider');
exports.router = require('./Routing/Router');
exports.MySqlConnection = require('./Database/MySqlConnection');
