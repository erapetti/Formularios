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
				//session = {Sesionesid:1,Userid:'u17488617',Dependid:1023,Lugarid:1023};
				session = {Sesionesid:1,Userid:'u18753938',Dependid:5830,Lugarid:5830};
			}
			if (err) {
				sails.log("forbidden", req.url, err);
				return res.forbidden(err);
			}

			var formid = req.param('id');
			if (!(formid>0)) {
				return res.serverError(new Error("Parámetros incorrectos"));
			}

			var preview = req.param('preview');

			Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
				if (err) {
					return res.serverError(err);
				}

				if (!config) {
					return res.serverError(new Error("No existe el formulario solicitado"));
				}

				config.Userid = session.Userid;
				config.Dependid = session.Dependid;
				config.Lugarid = session.Lugarid;
				config.ci = session.Userid.substr(1);
				config.preview = preview;
				if (config.hasta) {
					config.hasta.setHours(23);
					config.hasta.setMinutes(59);
					config.hasta.setSeconds(59);
				}

				var ahora = new Date();
				if (!(config.desde <= ahora && ahora <= config.hasta) && !preview) {
					return res.view("error.ejs", {title:config.titulo, mensaje:"Formulario deshabilitado porque estamos fuera del período de validez"});
				}

// console.log(config);

				// cargo el código js de los módulos que están activos en este formulario
				var requests = config.modulos.map(function(m) {
					try {
						var c = require("./"+m.modid.capitalizeFirstLetter()+"Controller.js");
						return new Promise(function(resolve,reject) {
							c.load({config:config, m:m}, resolve, reject);
						});
					} catch(e) {if(e.code!=="MODULE_NOT_FOUND") {console.log("catch",e);}};
				});

				// espero a que termine la carga...
				Promise.all(requests).then(function(){
					// todas las propises terminaron resolved (i.e. con éxito)
					Recibidos.findOne({formid:formid,cedula:config.ci}).exec(function(err,recibido) {
						if (err) {
							return res.serverError(err);
						}

						if (recibido && !preview) {
							// ya está registrado el usuario para este formulario

							// recorro el json guardado en la base y voy cargando los valores
							// en los m.value correspondientes para poder mostrarlos en la UI
							Object.keys(recibido.json).forEach(function(prop) {
								config.modulos.map(function(m){
									if (m.nombre===prop) {
										// console.log("encontré en "+m.modid+" = "+recibido.json[prop]);
										m.value = recibido.json[prop];
									}
								});
							});
							recibido.updatedAt = recibido.updatedAt.fecha_toString();
							return res.view({title:config.titulo,config:config,recibido:recibido});
						}

						if (req.param('submit')) {
							// llamada por ajax
							var values = req.allParams();
							var recibido = {};
							delete values.submit;
							delete values._csrf;
							recibido.formid = values.id;
							delete values.id;
							recibido.cedula = values.cedula;
							delete values.cedula;
							recibido.ip = req.connection.remoteAddress;
							recibido.nombre = values.nombre;
							delete values.nombre;
							recibido.correo = values.correo;
							delete values.correo;
							recibido.telefono = values.telefono;
							delete values.telefono;
							recibido.json = values;
							Recibidos.create(recibido).exec(function(err,record){
								if (err) {
									return res.json(500,{message:err.message});
								}
								return res.json(200,{message:"Quedó registrado con el número "+record.id});
							});
						} else {
							return res.view({title:config.titulo,config:config,id:undefined});
						}
					});
				}).catch(function(error){
					return res.serverError(error);  // error en alguna promise
				});
			});
		});
	},
};

Date.prototype.fecha_toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%02d/%02d/%04d", this.getDate(),this.getMonth()+1,this.getFullYear());
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
