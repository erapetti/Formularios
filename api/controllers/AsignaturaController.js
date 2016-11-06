/**
 * AsignaturaController
 *
 * @description :: Server-side logic for managing asignaturas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,callback) {
 		Asignaturas.find().sort("AsignDesc").exec(function(err,asignaturas) {
 			if (err) {
 				param.config.err.push(err);
 			} else {
				param.m.options = asignaturas;
 			}
 			callback(err);
 		});
 	}
 };
