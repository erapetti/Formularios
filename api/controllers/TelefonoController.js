/**
 * TelefonoController
 *
 * @description :: Server-side logic for managing telefonos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Personas.telefono(param.config.ci, function(err,telefono) {
 			if (err) {
 				return reject(err);
 			} else {
        param.m.value = typeof telefono !== 'undefined' ? telefono.PerTelNro : "";
        return resolve(undefined);
 			}
 		});
 	},
  modedit: function() {
    return {nombre:"telefono", etiqueta:"Teléfono", texto1:undefined, texto2:undefined, ayuda:"Texto en gris dentro del campo", validador:"novacio", opcional:"on"};
  },
 };
