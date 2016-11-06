/**
 * FormController
 *
 * @description :: Server-side logic for managing forms
 * @help		:: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 */
/* ex: set tabstop=4 softtabstop=0 noexpandtab shiftwidth=4
 */

module.exports = {

	index: function (req, res) {
		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			sessionid = req.cookies.SESION.replace(/[+ ]/g,'');
		}
		wsPortal.getSession(sessionid, function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				//session = {Sesionesid:1,Userid:'u10121248',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u19724241',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u13683344',Dependid:1023,Lugarid:1023};
				session = {Sesionesid:1,Userid:'u17488617',Dependid:1023,Lugarid:1023};
			}
			if (err) {
				return res.forbidden(err);
			}

			var formid = req.param('id');
			if (!(formid>0)) {
				return res.serverError(new Error("Parámetros incorrectos"));
			}

			Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
					if (err) {
						return res.serverError(err);
					}

					var ahora = new Date();
					if (config.desde > ahora || config.hasta < ahora) {
						return res.view("error.ejs", {title:config.titulo, mensaje:"Formulario deshabilitado porque estamos fuera del período de validez"});
					}

					config.Userid = session.Userid;
					config.Dependid = session.Dependid;
					config.Lugarid = session.Lugarid;
					config.ci = session.Userid.substr(1);
					config.err = Array();
//					console.log(config);

					var requests = config.modulos.map(function(m) {
						try {
							var c = require("./"+m.modid.capitalizeFirstLetter()+"Controller.js");
							return new Promise(function(resolve) {
								c.load({config:config, m:m}, resolve);
							});
						} catch(e) {if(e.code!=="MODULE_NOT_FOUND") {console.log("catch",e);}};
					});
					Promise.all(requests).then(function(){
						if (config.err.length > 0) {
							console.log("error",err);
							return res.serverError("ERROR");
						}
						return res.view({title:config.titulo,config:config});
					});
			})
		});

	},
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
