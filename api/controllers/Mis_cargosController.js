/**
 * Mis_CargosController
 *
 * @description :: Server-side logic for managing mis_cargos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
    var ahora = new Date();
 		DenominacionesCargos.misCargos(param.config.ci,ahora.fecha_ymd_toString(),'2099-01-01',function(err,cargos) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = cargos;
        return resolve(undefined);
 			}
 		});
 	},
 };
