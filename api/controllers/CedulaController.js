/**
 * CedulaController
 *
 * @description :: Server-side logic for managing cedulas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param, resolve, reject) {
 		param.m.value = param.config.ci;
 		return resolve(undefined);
 	},
  modedit: function() {
    return {nombre:"cedula", etiqueta:"Cédula", texto1:undefined, texto2:undefined, ayuda:"Texto en gris dentro del campo", validador:"numero", opcional:"no"};
  },
 };
