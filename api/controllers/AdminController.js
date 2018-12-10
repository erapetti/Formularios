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

		Recibidos.find({formid:req.formId,borrado:false}).exec(function(err,recibidos) {
			if (err) {
				return res.serverError(err);
			}

			res.set('Content-type','text/tab-separated-values; charset=utf-8');
			recibidos.forEach(function(item) {
				item.updatedAt = item.updatedAt.fecha_ymdhms_toString();
			});
			return res.view("admin/download.ejs",{layout:'',config:req.config,recibidos:recibidos});
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

		let titulo = req.param('titulo').trim();
		let desde = req.param('desde').trim();
		let hasta = req.param('hasta').trim();
		let publico = req.param('publico')=='on';
		let multiple = req.param('multiple')=='on';

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
		Config.update({formid:req.formId},{titulo:titulo,desde:desde,hasta:hasta,publico:publico,multiple:multiple}).exec(function(err,updated){
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
					return res.redirect(sails.config.baseurl + 'form/modedit?formId='+req.formId);
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
					return res.redirect(sails.config.baseurl + 'form/modedit?formId='+req.formId);
				});
			} else {
				return res.serverError(new Error("El componente ya está en el último lugar"));
			}

		} else if (action == "editar") {
			Modulos.findOne({formid:req.formId,orden:orden}).exec(function(err,m){
				if (err) {
						return res.serverError(err);
				}
				if (typeof m === 'undefined') {
					return res.serverError(new Error("No se encuentra el componente #"+orden));
				}
				if (typeof sails.controllers[m.modid] === 'undefined' || typeof sails.controllers[m.modid].modedit === 'undefined') {
					return res.serverError(new Error("Los componentes de tipo "+m.modid+" no pueden ser editados"));
				}
				["nombre","etiqueta","ayuda"].forEach(campo => {
					if (m[campo] == null) {
						m[campo]="";
					}
				});
				sails.controllers[m.modid].load({config:req.config,m:m},function(){
					m.config = sails.controllers[m.modid].modedit();
					var modulos = Object.keys(sails.controllers).filter(x => (x !== "form" && x !== "admin"));
					var validadores = Array({id:"nop",desc:"Sin Validador"},{id:"correo",desc:"Correo electrónico"},{id:"novacio",desc:"No vacío"},{id:"numero",desc:"Es número"},{id:"edad",desc:"Edad"});
					return res.view("admin/modedit.ejs",{title:'Editar Componente',formId:req.formId,m:m,session:req.session,modulos:modulos,validadores:validadores});
				},function(err){
					return res.serverError(err);
				});
			});

		} else if (action == "borrar") {
			Modulos.findOne({formid:req.formId,orden:orden}).exec(function(err,m){
				if (err) {
					return res.serverError(err);
				}
				if (!m) {
					return res.serverError(new Error("Módulo no encontrado para borrar"));
				}
				if (m.modid == "grupo_cierra") {
					return res.serverError(new Error("Los módulos grupo_cierra no se pueden borrar"));
				}
				Modulos.destroy({formid:req.formId,id:m.id}).exec(function(err){
					if (err) {
						return res.serverError(err);
					}
					if (m.modid == "grupo_abre") {
						Modulos.findOne({where:{formid:req.formId,orden:{'>':orden},modid:"grupo_cierra"},sort:"orden"}).exec(function(err,m2){
							if (err) {
								return res.serverError(err);
							}
							if (!m2) {
								return res.serverError(new Error("Módulo grupo_cierra no encontrado para borrar"));
							}
							Modulos.destroy({formid:req.formId,id:m2.id}).exec(function(err){
								if (err) {
									return res.serverError(err);
								}
								return res.redirect(sails.config.baseurl + 'form/modedit?formId='+req.formId);
							});
						});
					} else {
						return res.redirect(sails.config.baseurl + 'form/modedit?formId='+req.formId);
					}
				});
			});

		} else if (action == "crear") {
			Modulos.findOne({formid:req.formId,orden:{'<':999}}).sort('orden DESC').exec(function(err,m){
				if (err) {
					return res.serverError(err);
				}
				let orden = (!m ? 1 : m.orden+1);
				let modid = "input_text";
				Modulos.create({formid:req.formId,modid:modid,orden:orden}).exec(function(err,created){
					if (err) {
						return res.serverError(err);
					}
					return res.redirect(sails.config.baseurl + 'admin/modedit?formId='+req.formId+'&orden='+orden+'&action=editar');
				});
			});

		} else if (action == "guardar" || action == "guardar_siguiente") {
			let modid=req.param("modid");
			let nombre=req.param("nombre");
			let etiqueta=req.param("etiqueta");
			let texto1=req.param("texto1");
			let texto2=req.param("texto2");
			let ayuda=req.param("ayuda");
			let validador=req.param("validador");
			let opcional=req.param("opcional") === "on";
			if (!modid) {
				return res.serverError(new Error("Parámetros incorrectos"));
			}
			let ordenOriginal = orden;
			orden = (modid == "intro" ? 1 : (modid == "pie" ? 999 : orden));
			Modulos.update({formid:req.formId,orden:ordenOriginal},{modid:modid,orden:orden,nombre:nombre,etiqueta:etiqueta,texto1:texto1,texto2:texto2,ayuda:ayuda,validador:validador,opcional:opcional}).exec(function(err,updated){
				if (err) {
					return res.serverError(err);
				}
				if (action == "guardar") {
					return res.redirect(sails.config.baseurl + 'admin/modedit?formId='+req.formId+'&orden='+orden+'&action=editar');
				} else {
					Modulos.findOne({formid:req.formId,orden:{'>':orden}}).sort('orden').exec(function(err,m){
						if (err) {
							return res.serverError(err);
						}
						if (!m) {
							// no hay siguiente
							return res.redirect(sails.config.baseurl + 'form/modedit?formId='+req.formId);
						}
						return res.redirect(sails.config.baseurl + 'admin/modedit?formId='+req.formId+'&orden='+m.orden+'&action=editar');
					});
				}
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
Date.prototype.fecha_ymdhms_toString = function() {
	var sprintf = require("sprintf");
	return sprintf("%04d-%02d-%02d %02s:%02s:%02s", this.getFullYear(),this.getMonth()+1,this.getDate(),this.getHours(),this.getMinutes(),this.getSeconds());
};
