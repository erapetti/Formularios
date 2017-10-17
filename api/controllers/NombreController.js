/**
 * NombreController
 *
 * @description :: Server-side logic for managing nombres
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	load: function(param,resolve,reject) {
		Personas.nombre(param.config.ci, function(err,persona) {
			if (err) {
				return reject(err);
			}

			param.m.value = typeof persona !== 'undefined' ? persona.pernombrecompleto : "";
			if (!param.config.perid && typeof persona !== 'undefined') {
						param.config.perid = persona.perid;
			}
			return resolve(undefined);
		});
	},
	modedit: function() {
		return {nombre:"nombre", etiqueta:"Nombre", texto1:undefined, texto2:undefined, ayuda:"Texto en gris dentro del campo", validador:"novacio", opcional:"no"};
	},
};
