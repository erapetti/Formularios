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
			} else {

				param.m.value = typeof persona !== 'undefined' ? persona.pernombrecompleto : "";
				if (!param.config.perid && typeof persona !== 'undefined') {
							param.config.perid = persona.perid;
				}
				return resolve(undefined);
			}
		});
	},
};
