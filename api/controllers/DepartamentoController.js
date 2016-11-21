/**
 * DepartamentoController
 *
 * @description :: Server-side logic for managing departamentos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Departamentos.find().sort("DeptoNombre").exec(function(err,departamentos) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = departamentos;
        return resolve(undefined);
 			}
 		});
 	},
 };
