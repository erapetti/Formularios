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
  modedit: function() {
    return {nombre:"dependencia", etiqueta:"Dependencia", texto1:undefined, texto2:undefined, ayuda:"Texto que se muestra a la derecha", validador:"novacio", opcional:"on"};
  },
 };
