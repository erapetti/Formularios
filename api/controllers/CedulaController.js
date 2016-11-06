/**
 * CedulaController
 *
 * @description :: Server-side logic for managing cedulas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param, callback) {
 		param.m.value = param.config.ci;
 		callback(undefined);
 	}
 };
