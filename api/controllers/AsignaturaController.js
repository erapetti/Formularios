/**
 * AsignaturaController
 *
 * @description :: Server-side logic for managing asignaturas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Asignaturas.find().sort("AsignDesc").exec(function(err,asignaturas) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = asignaturas;
        return resolve(undefined);
 			}
 		});
 	},
 };
