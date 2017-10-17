/**
 * AsignaturaController
 *
 * @description :: Server-side logic for managing asignaturas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
 		Asignaturas.find({TipoEscalafon:{'!':null}}).sort("AsignDesc").exec(function(err,asignaturas) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = asignaturas;
        return resolve(undefined);
 			}
 		});
 	},
  modedit: function() {
    return {nombre:"asignatura", etiqueta:"Asignatura", texto1:undefined, texto2:undefined, ayuda:"Texto que se muestra a la derecha", validador:"novacio", opcional:"on"};
  },
 };
