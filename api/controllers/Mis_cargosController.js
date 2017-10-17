/**
 * Mis_CargosController
 *
 * @description :: Server-side logic for managing mis_cargos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
    var ahora = new Date();
 		DenominacionesCargos.misCargos(param.config.ci,ahora.fecha_ymd_toString(),'2099-01-01',function(err,cargos) {
 			if (err) {
 				return reject(err);
 			} else {
				param.m.options = Array();
        cargos.forEach(function(cargo){
          if (cargo.TipoCargoId > 1) {
            param.m.options.push(cargo);
          }
        });
        return resolve(undefined);
 			}
 		});
 	},
  modedit: function() {
    return {nombre:"cargo", etiqueta:"Cargo", texto1:undefined, texto2:undefined, ayuda:"Texto que se muestra a la derecha", validador:"novacio", opcional:"on"};
  },
 };
