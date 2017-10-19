/**
 * SelectController
 *
 * @description :: Server-side logic for managing select
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
    param.m.options = [];
    try {
      if (typeof param.m.texto1 !== 'undefined' && param.m.texto1) {
        JSON.parse(param.m.texto1).forEach(function(op){
          param.m.options.push({id:op,desc:op});
        });
      }
      return resolve(undefined);
    } catch(err) {
      console.log("error parsing "+param.m.texto1);
      return reject(new Error(err));
    };
 	},
  modedit: function() {
    return {nombre:"menu", etiqueta:"Menú de opciones", texto1:"Array de opciones entre comillas dobles", texto2:undefined, ayuda:"Texto que se muestra a la derecha", validador:"novacio", opcional:"on"};
  },
 };
