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
    return {nombre:"checkbox", etiqueta:"Checkbox", texto1:"Texto que se muestra en una fila debajo del campo", texto2:undefined, ayuda:"Texto que se muestra a la derecha", validador:"nop", opcional:"on"};
  },
 };
