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

			Config.recibidos(function(err, data){
				if (err) {
					return res.serverError(err);
				}

				config.titulo="Administración de formularios";
				return res.view({title:config.titulo,config:config,cantidad:data.cantidad,borrados:data.borrados});
			});
		});
	},

	download: function (req, res) {

		Recibidos.find({formid:req.formId,borrado:false}).exec(function(err,recibido) {
			if (err) {
				return res.serverError(err);
			}

			res.set('Content-type','text/tab-separated-values; charset=utf-8');
			return res.view("admin/download.ejs",{layout:'',config:req.config,recibido:recibido});
		});
	},

	clonar: function (req, res) {

		// duplico el formulario
		var formulario = {titulo:"Copia de "+req.config.titulo};
		Config.create(formulario).exec(function(err,form){
			if (err) {
				return res.json(500,{message:err.message});
			}

			// duplico los módulos
			var requests = req.config.modulos.map(function(m) {
				m.formid = form.formid;
				delete m.id;
				delete m.createdAt;
				delete m.updateAt;
				return Modulos.create(m);
			});
			Promise.all(requests).then(function(){

				return res.json(200,{message:"El nuevo formulario quedó registrado con el número "+form.formid});
			}).catch(function(){

				return res.json(500,{message:"Error al copiar los módulos del nuevo formulario "+form.formid});
			});
		});
	},

	borrar: function (req, res) {

		Recibidos.findOne({formid:req.formId}).exec(function(err,recibido) {
			if (err) {
				return res.json(500,{message:err.message});
			}

			if (recibido && recibido.length>0) {
				return res.json(500,{message:"No se puede borrar un formulario que tiene envíos recibidos aunque estén borrados"});
			}

			// borro los módulos
			var requests = req.config.modulos.map(function(m) {
				return Modulos.destroy({id:m.id});
			});
			Promise.all(requests).then(function(){

				// borro el formulario
				Config.destroy({formid:req.formId}).exec(function(err) {
					if (err) {
						return res.json(500,{message:"Error al borrar formulario "+req.formId});
					}

					return res.json(200,{message:"Quedó borrado el formulario "+req.formId});
				});

			}).catch(function(err){

				return res.json(500,{message:"Error al borrar los módulos del formulario "+req.formId});
			});
		});
	},

	edit: function (req, res) {

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
		Config.update({formid:req.formId},{titulo:titulo,desde:desde,hasta:hasta}).exec(function(err,updated){
			if (err) {
				return res.json(500,{message:err.message});
			}
			return res.json(200,{message:"OK"});
		});
	},



	modedit: function (req, res) {

		var action = req.param("action");
		var orden = parseInt(req.param("orden"));

		if (action == "subir") {
			if (orden > 1) {
				Modulos.subir(req.formId,orden,function(err){
					if (err) {
						return res.serverError(err);
					}
					return res.redirect('/form/modedit?formId='+req.formId);
				});
			} else {
					return res.serverError(new Error("El componente ya está en el primer lugar"));
			}

		} else if (action == "bajar") {
			if (orden < 999) {
				Modulos.bajar(req.formId,orden,function(err){
					if (err) {
						return res.serverError(err);
					}
					return res.redirect('/form/modedit?formId='+req.formId);
				});
			} else {
				return res.serverError(new Error("El componente ya está en el último lugar"));
			}

		} else if (action == "editar") {
			Modulos.findOne({formid:req.formId,orden:orden}).exec(function(err,m){
				if (err) {
						return callback(err);
				}
				if (typeof m === 'undefined') {
					return callback(new Error("No se encuentra el componente #"+orden));
				}
				if (typeof sails.controllers[m.modid] === 'undefined' || typeof sails.controllers[m.modid].modedit === 'undefined') {
					return res.serverError(new Error("Los componentes de tipo "+m.modid+" no pueden ser editados"));
				}
				sails.controllers[m.modid].load({config:req.config,m:m},function(){
					m.config = sails.controllers[m.modid].modedit();
					return res.view("admin/modedit.ejs",{formId:req.formId,m:m});
				},function(err){
					return res.serverError(err);
				});
			});

		} else if (action == "borrar") {
			Modulos.destroy({formid:req.formId,orden:orden}).exec(function(err){
				if (err) {
					return res.serverError(err);
				}
				return res.redirect('/form/modedit?formId='+req.formId);
			});

		} else if (action == "crear") {
			return res.redirect('/form/modedit?formId='+req.formId);

		} else if (action == "guardar") {
			var nombre=req.param("nombre");
			var etiqueta=req.param("etiqueta");
			var texto1=req.param("texto1");
			var texto2=req.param("texto2");
			var ayuda=req.param("ayuda");
			var validador=req.param("validador");
			var opcional=req.param("opcional") === "on";
			Modulos.update({formid:req.formId,orden:orden},{nombre:nombre,etiqueta:etiqueta,texto1:texto1,texto2:texto2,ayuda:ayuda,validador:validador,opcional:opcional}).exec(function(err,updated){
				if (err) {
					return res.serverError(err);
				}
				console.log(updated);
				return res.redirect('/form/modedit?formId='+req.formId);
			});

		} else {
			return res.serverError(new Error("La acción "+action+" no está definida"));
		}
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
