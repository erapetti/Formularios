/**
 * Input_textController
 *
 * @description :: Server-side logic for managing input_text
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
    return resolve(undefined);
 	},
  modedit: function() {
    return {nombre:undefined, etiqueta:undefined, texto1:undefined, texto2:undefined, ayuda:undefined, validador:undefined, opcional:undefined};
  },
 };
