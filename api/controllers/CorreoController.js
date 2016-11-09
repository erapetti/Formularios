/**
 * CorreoController
 *
 * @description :: Server-side logic for managing correos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Personas.correo(param.config.ci, function(err,correo) {
 			if (err) {
 				return reject(err);
 			} else {
 				param.m.value = typeof correo !== 'undefined' ? correo.PerMailDir : "";
        return resolve(undefined);
 			}
 		});
 	},
 };
