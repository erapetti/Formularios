/**
 * CorreoController
 *
 * @description :: Server-side logic for managing correos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,callback) {
 		Personas.correo(param.config.ci, function(err,correo) {
 			if (err) {
 				param.config.err.push(err);
 			} else {
 				param.m.value = correo.PerMailDir;
 			}
 			callback(err);
 		});
 	}
 };
