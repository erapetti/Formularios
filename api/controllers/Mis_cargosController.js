/**
 * Mis_CargosController
 *
 * @description :: Server-side logic for managing mis_cargos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		DenominacionesCargos.misCargos(param.config.ci, function(err,cargos) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = cargos;
        return resolve(undefined);
 			}
 		});
 	},
 };
