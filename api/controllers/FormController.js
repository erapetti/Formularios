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

		var formid = req.param('id') || req.param('formId');
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

			config.Userid = req.session.Userid;
			config.Dependid = req.session.Dependid;
			config.Lugarid = req.session.Lugarid;
			config.ci = req.session.Userid.substr(1);
			config.preview = req.session.preview;
			if (config.hasta) {
				config.hasta.setHours(23);
				config.hasta.setMinutes(59);
				config.hasta.setSeconds(59);
			}

			var ahora = new Date();
			if (!(config.desde <= ahora && ahora <= config.hasta) && !req.session.preview) {
				return res.view("error.ejs", {title:config.titulo, mensaje:"Formulario deshabilitado porque estamos fuera del período de validez"});
			}

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
				// todas las promises terminaron resolved (i.e. con éxito)
				Recibidos.findOne({formid:formid,cedula:config.ci,borrado:false}).exec(function(err,recibido) {
					if (err) {
						return res.serverError(err);
					}

					if (recibido && !req.session.preview) {
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
						return res.view("form/index.ejs",{title:config.titulo,config:config,recibido:recibido});
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
						recibido.borrado = false;
						Recibidos.create(recibido).exec(function(err,record){
							if (err) {
								return res.json(500,{message:err.message});
							}
							return res.json(200,{message:"Quedó registrado con el número "+record.id});
						});
					} else {
						return res.view("form/index.ejs",{title:config.titulo,config:config,id:undefined});
					}
				});
			}).catch(function(error){
				return res.serverError(error);  // error en alguna promise
			});
		});
	},

	// alias de index para usarlo en la validación de permisos
	preview: function (req, res) {

		req.session.preview = 1;
		sails.controllers.form.index(req, res);
	},

};

Date.prototype.fecha_toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%02d/%02d/%04d", this.getDate(),this.getMonth()+1,this.getFullYear());
};

Date.prototype.fecha_ymd_toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%04d-%02d-%02d", this.getFullYear(),this.getMonth()+1,this.getDate());
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
