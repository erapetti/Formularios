/**
 * AdminController
 *
 * @description :: Server-side logic for managing formularios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	index: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			if (typeof req.cookies.SESION !== "string") {
				return res.forbidden(new Error("Debe iniciar sesión en el portal de servicios"));
			}
			sessionid = req.cookies.SESION.replace(/[+ ]/g,'');
		}
		wsPortal.getSession(sessionid, req.url.substr(1), function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				//session = {Sesionesid:1,Userid:'u10121248',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u19724241',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u13683344',Dependid:1023,Lugarid:1023};
				session = {Sesionesid:1,Userid:'u17488617',Dependid:1023,Lugarid:1023};
			}
			if (err) {
				sails.log("forbidden", req.url, err);
				return res.forbidden(err);
			}

			Config.find().sort('formid desc').exec(function(err,config){
				if (err) {
					return res.serverError(err);
				}

				Config.recibidos(function(err, cantidad){
					if (err) {
						return res.serverError(err);
					}

					config.titulo="Administración de formularios";
					return res.view({title:config.titulo,config:config,cantidad:cantidad});
				});
			});
		});
	},

	download: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			if (typeof req.cookies.SESION !== "string") {
				return res.forbidden(new Error("Debe iniciar sesión en el portal de servicios"));
			}
			sessionid = req.cookies.SESION.replace(/[+ ]/g,'');
		}
		wsPortal.getSession(sessionid, req.url, function(err,session) {
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

				if (!config) {
					return res.serverError(new Error("No existe el formulario solicitado"));
				}

				Recibidos.find({formid:formid}).exec(function(err,recibido) {
					if (err) {
						return res.serverError(err);
					}

					res.set('Content-type','text/tab-separated-values');
					return res.view("admin/download.ejs",{layout:'',config:config,recibido:recibido});
				});
			});
		});
	},

};

Date.prototype.toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%02d/%02d/%04d", this.getDate(),this.getMonth()+1,this.getFullYear());
};
