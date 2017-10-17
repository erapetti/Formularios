/**
 * DepartamentoController
 *
 * @description :: Server-side logic for managing departamentos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Departamentos.find({DeptoId:{'<':20}}).sort("DeptoNombre").exec(function(err,departamentos) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = departamentos;
        return resolve(undefined);
 			}
 		});
 	},
  modedit: function() {
    return {nombre:"departamento", etiqueta:"Departamento", texto1:undefined, texto2:undefined, ayuda:"Texto que se muestra a la derecha", validador:"novacio", opcional:"on"};
  },
 };
