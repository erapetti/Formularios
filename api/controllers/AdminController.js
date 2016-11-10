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
		wsPortal.getSession(sessionid, req.url.substr(1).replace(/\?.*/,''), function(err,session) {
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

	clonar: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			if (typeof req.cookies.SESION !== "string") {
				return res.forbidden(new Error("Debe iniciar sesión en el portal de servicios"));
			}
			sessionid = req.cookies.SESION.replace(/[+ ]/g,'');
		}
		wsPortal.getSession(sessionid, req.url.substr(1).replace(/\?.*/,''), function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				//session = {Sesionesid:1,Userid:'u10121248',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u19724241',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u13683344',Dependid:1023,Lugarid:1023};
				session = {Sesionesid:1,Userid:'u17488617',Dependid:1023,Lugarid:1023};
			}
			if (err) {
				return res.json({code:403,message:err.message});
			}

			var formid = req.param('id');
			if (!(formid>0)) {
				return res.json({code:500,message:"Parámetros incorrectos"});
			}

			Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
				if (err) {
					return res.json({code:500,message:err.message});
				}

				if (!config) {
					return res.json({code:500,message:"No existe el formulario solicitado"});
				}

				// duplico el formulario
				var formulario = {titulo:"Copia de "+config.titulo};
				Config.create(formulario).exec(function(err,form){
					if (err) {
						return res.json({code:500,message:err.message});
					}

					// duplico los módulos
					var requests = config.modulos.map(function(m) {
						m.formid = form.formid;
						delete m.id;
						delete m.createdAt;
						delete m.updateAt;
						return Modulos.create(m);
					});
					Promise.all(requests).then(function(){

						return res.json({code:200,message:"Quedó registrado con el número "+form.formid});
					}).catch(function(){

						console.log("ERROR al copiar módulos");
						return res.json({code:500,message:"Error al copiar los módulos del nuevo formulario "+form.formid});
					});
				});
			});
		});
	},

	borrar: function (req, res) {

		var sessionid;
		if (sails.config.environment === "development") {
			sessionid = '9728448076454730240';
		} else {
			if (typeof req.cookies.SESION !== "string") {
				return res.forbidden(new Error("Debe iniciar sesión en el portal de servicios"));
			}
			sessionid = req.cookies.SESION.replace(/[+ ]/g,'');
		}
		wsPortal.getSession(sessionid, req.url.substr(1).replace(/\?.*/,''), function(err,session) {
			if (sails.config.environment === "development") {
				err = undefined;
				//session = {Sesionesid:1,Userid:'u10121248',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u19724241',Dependid:1023,Lugarid:1023};
				//session = {Sesionesid:1,Userid:'u13683344',Dependid:1023,Lugarid:1023};
				session = {Sesionesid:1,Userid:'u17488617',Dependid:1023,Lugarid:1023};
			}
			if (err) {
				return res.json({code:403,message:err.message});
			}

			var formid = req.param('id');
			if (!(formid>0)) {
				return res.json({code:500,message:"Parámetros incorrectos"});
			}

			Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
				if (err) {
					return res.json({code:500,message:err.message});
				}

				if (!config) {
					return res.json({code:500,message:"No existe el formulario solicitado"});
				}

				Recibidos.find({formid:formid}).exec(function(err,recibido) {
					if (err) {
						return res.json({code:500,message:err.message});
					}

					if (recibido && recibido.length>0) {
						return res.json({code:500,message:"No se puede borrar un formulario que tiene envíos recibidos"});
					}

					// borro los módulos
					var requests = config.modulos.map(function(m) {
						return Modulos.destroy({id:m.id});
					});
					Promise.all(requests).then(function(){

						// borro el formulario
						Config.destroy({formid:formid}).exec(function(err) {
							if (err) {
								console.log("ERROR al borrar formulario "+formid,err);
								return res.json({code:500,message:"Error al borrar formulario "+formid});
							}

							return res.json({code:200,message:"Quedó borrado el formulario "+formid});
						});

					}).catch(function(err){

						console.log("ERROR al borrar los módulos del formulario "+formid,err);
						return res.json({code:500,message:"Error al borrar los módulos del formulario "+formid});
					});
				});
			});
		});
	},

};

Date.prototype.toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%02d/%02d/%04d", this.getDate(),this.getMonth()+1,this.getFullYear());
};
