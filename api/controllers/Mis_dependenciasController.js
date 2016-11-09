/**
 * Mis_dependenciasController
 *
 * @description :: Server-side logic for managing mis_dependencias
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Dependencias.misDependencias(param.config.ci, function(err,dependencias) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = dependencias;
        return resolve(undefined);
 			}
 		});
 	},
 };
