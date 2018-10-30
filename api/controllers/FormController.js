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

		// cargo el código js de los módulos que están activos en este formulario
		var requests = req.config.modulos.map(function(m) {
			if (typeof sails.controllers[m.modid] !== 'undefined' && typeof sails.controllers[m.modid].load === 'function') {
				return new Promise(function(resolve,reject) {
					sails.controllers[m.modid].load({config:req.config, m:m}, resolve, reject);
				});
			}
		});

		// espero a que termine la carga...
		Promise.all(requests).then(function(){
			// todas las promises terminaron resolved (i.e. con éxito)
			Recibidos.findOne({formid:req.formId,cedula:req.config.ci,borrado:false}).exec(function(err,recibido) {
				if (err) {
					return res.serverError(err);
				}

				if (recibido && req.session && !req.session.preview) {
					// ya está registrado el usuario para este formulario y no estoy en modo preview

					// recorro el json guardado en la base y voy cargando los valores
					// en los m.value correspondientes para poder mostrarlos en la UI
					Object.keys(recibido.json).forEach(function(prop) {
						req.config.modulos.map(function(m){
							if (m.nombre===prop) {
								m.value = recibido.json[prop];
							}
						});
					});
					recibido.updatedAt = recibido.updatedAt.fecha_toString();
					return res.view("form/index.ejs",{title:req.config.titulo,config:req.config,recibido:recibido});
				}

				if (req.param('submit')) {
					// llamada por ajax
					sails.controllers.form.guardar(req, res);
				} else {
					return res.view("form/index.ejs",{title:req.config.titulo,config:req.config,id:undefined});
				}
			});
		}).catch(function(error){
			return res.serverError(error);  // error en alguna promise
		});
	},

	// alias de index para usarlo en la validación de permisos
	preview: function (req, res) {

		req.config.preview = 1;
		return sails.controllers.form.index(req, res);
	},

	// alias de index para usarlo en la validación de permisos
	publico: function (req, res) {

		if (req.config.publico != 1) {
			return res.view("error.ejs", {title:req.config.titulo, mensaje:"Formulario deshabilitado para el acceso público"});
		}
		return sails.controllers.form.index(req, res);
	},

	// alias de index para usarlo en la validación de permisos
	modedit: function (req, res) {

		req.config.preview = 1;
		req.config.modedit = 1;
		sails.controllers.form.index(req, res);
	},

	// ajax para borrar un formulario recibido
	borrar: function (req, res) {

		var recordId = req.param("recordId");
		Recibidos.update({formid:req.formId,cedula:req.config.ci,borrado:false,id:recordId}, {borrado:true}).exec(function(err, updated){
			if (err) {
				return res.json(500,{message:err.message});
			}
			if (updated.length < 1) {
				return res.json(500,{message:"No se encuentra el registro número "+recordId});
			}
			return res.json(200,{message:"Formulario número "+recordId+" borrado"});
		});
	},

	// auxiliar para salvar un nuevo formulario recibido
	guardar: function(req, res) {
		var values = req.allParams();
		var recibido = {};
		delete values.submit;
		delete values._csrf;
		recibido.formid = values.id;
		delete values.id;
		recibido.cedula = req.config.ci;
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
