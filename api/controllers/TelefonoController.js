/**
 * TelefonoController
 *
 * @description :: Server-side logic for managing telefonos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Personas.telefono(param.config.ci, function(err,telefono) {
 			if (err) {
 				return reject(err);
 			} else {
 				param.m.value = telefono.PerTelNro;
        return resolve(undefined);
 			}
 		});
 	},
 };
