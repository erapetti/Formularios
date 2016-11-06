/**
 * NombreController
 *
 * @description :: Server-side logic for managing nombres
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	load: function(param,callback) {
		Personas.nombre(param.config.ci, function(err,persona) {
			if (err) {
				param.config.err.push(err);
			} else {
				param.m.value = persona.pernombrecompleto;
				if (!param.config.perid) {
							param.config.perid = persona.perid;
				}
			}
			callback(err);
		});
	}
};
