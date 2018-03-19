/**
 * CredencialController
 *
 * @description :: Server-side logic for managing credenciales
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	load: function(param,resolve,reject) {
		Personas.credencial(param.config.ci, function(err,persona) {
			if (err) {
				return reject(err);
			}

			param.m.value = typeof persona !== 'undefined' ? persona.PerDocId : "";
			return resolve(undefined);
		});
	},
	modedit: function() {
		return {nombre:"credencial", etiqueta:"Credencial", texto1:undefined, texto2:undefined, ayuda:"Texto en gris dentro del campo", validador:"novacio", opcional:"on"};
	},
};
