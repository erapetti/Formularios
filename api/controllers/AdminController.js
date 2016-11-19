/**
 * AdminController
 *
 * @description :: Server-side logic for managing formularios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	index: function (req, res) {

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
	},

	download: function (req, res) {

		var formid = req.param('formId');
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

			Recibidos.find({formid:formid,borrado:false}).exec(function(err,recibido) {
				if (err) {
					return res.serverError(err);
				}

				res.set('Content-type','text/tab-separated-values; charset=utf-8');
				return res.view("admin/download.ejs",{layout:'',config:config,recibido:recibido});
			});
		});
	},

	clonar: function (req, res) {

		var formid = req.param('formId');
		if (!(formid>0)) {
			return res.json(500,{message:"Parámetros incorrectos"});
		}

		Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
			if (err) {
				return res.json(500,{message:err.message});
			}

			if (!config) {
				return res.json(500,{message:"No existe el formulario solicitado"});
			}

			// duplico el formulario
			var formulario = {titulo:"Copia de "+config.titulo};
			Config.create(formulario).exec(function(err,form){
				if (err) {
					return res.json(500,{message:err.message});
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

					return res.json(200,{message:"El nuevo formulario quedó registrado con el número "+form.formid});
				}).catch(function(){

					console.log("ERROR al copiar módulos");
					return res.json(500,{message:"Error al copiar los módulos del nuevo formulario "+form.formid});
				});
			});
		});
	},

	borrar: function (req, res) {

		var formid = req.param('formId');
		if (!(formid>0)) {
			return res.json(500,{message:"Parámetros incorrectos"});
		}

		Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
			if (err) {
				return res.json(500,{message:err.message});
			}

			if (!config) {
				return res.json(500,{message:"No existe el formulario solicitado"});
			}

			Recibidos.find({formid:formid}).exec(function(err,recibido) {
				if (err) {
					return res.json(500,{message:err.message});
				}

				if (recibido && recibido.length>0) {
					return res.json(500,{message:"No se puede borrar un formulario que tiene envíos recibidos"});
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
							return res.json(500,{message:"Error al borrar formulario "+formid});
						}

						return res.json(200,{message:"Quedó borrado el formulario "+formid});
					});

				}).catch(function(err){

					console.log("ERROR al borrar los módulos del formulario "+formid,err);
					return res.json(500,{message:"Error al borrar los módulos del formulario "+formid});
				});
			});
		});
	},

	edit: function (req, res) {

		var formid = req.param('formId');
		if (!(formid>0)) {
			return res.json(500,{message:"Parámetros incorrectos"});
		}

		Config.findOne({formid:formid}).populate('modulos',{sort:'orden'}).exec(function(err,config){
			if (err) {
				return res.json(500,{message:err.message});
			}

			if (!config) {
				return res.json(500,{message:"No existe el formulario solicitado"});
			}

			var titulo = req.param('titulo').trim();
			var desde = req.param('desde').trim();
			var hasta = req.param('hasta').trim();
			if (!titulo || !desde || !hasta || titulo==="" || desde==="" || hasta==="") {
				return res.json(500,{message:"Debe especificar título, fecha desde y fecha hasta"});
			}
			if (!desde.match(/^20\d\d-[01]\d-[0-3]\d$/)) {
				return res.json(500,{message:"Fecha Desde en formato incorrecto.<br>El formato debe ser AAAA-MM-DD"});
			}
			if (!hasta.match(/^20\d\d-[01]\d-[0-3]\d$/)) {
				return res.json(500,{message:"Fecha Hasta en formato incorrecto.<br>El formato debe ser AAAA-MM-DD"});
			}
			// paso las fechas a UTCString y lo corro algunas horas porque hace conversión de TimeZone
			desde=desde + 'T05:00:00.000Z';
			hasta=hasta + 'T05:00:00.000Z';
			Config.update({formid:formid},{titulo:titulo,desde:desde,hasta:hasta}).exec(function(err,updated){
				if (err) {
					console.log("error en update",err);
					return res.json(500,{message:err.message});
				}
				return res.json(200,{message:"OK"});
			});
		});
	},

};

Date.prototype.fecha_toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%02d/%02d/%04d", this.getDate(),this.getMonth()+1,this.getFullYear());
};
Date.prototype.fecha_edit_toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%04d-%02d-%02d", this.getFullYear(),this.getMonth()+1,this.getDate());
};
