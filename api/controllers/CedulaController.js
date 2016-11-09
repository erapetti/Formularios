/**
 * CedulaController
 *
 * @description :: Server-side logic for managing cedulas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param, resolve, reject) {
 		param.m.value = param.config.ci;
 		return resolve(undefined);
 	},
 };
