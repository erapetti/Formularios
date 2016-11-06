/**
 * TelefonoController
 *
 * @description :: Server-side logic for managing telefonos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,callback) {
 		Personas.telefono(param.config.ci, function(err,telefono) {
 			if (err) {
 				param.config.err.push(err);
 			} else {
 				param.m.value = telefono.PerTelNro;
 			}
 			callback(err);
 		});
 	}
 };
