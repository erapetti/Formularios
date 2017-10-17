/**
 * Modulos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'config',
  migrate: 'alter',
  attributes: {
    modid: {
      type: 'string',
      required: true,
    },
    formid: {
      model: 'config',
      required: true,
    },
    orden: {
      type: 'integer',
      required: true,
    },
    nombre: 'string',
    texto1: 'longtext',
    texto2: 'longtext',
    ayuda: 'string',
    etiqueta: 'string',
    validador: 'string',
    validador_param: 'string',
    opcional: 'boolean',
  },

  bajar: function(formId,pos,callback) {
    Modulos.findOne({formid:formId,orden:pos}).exec(function(err,paraBajar){
      if (err) {
          return callback(err);
      }
      if (typeof paraBajar === 'undefined') {
        return callback(new Error("No se encuentra el componente #"+pos));
      }
      Modulos.find({formid:formId,orden:{'>':pos}}).sort('orden').limit(1).exec(function(err,paraSubir){
        if (err) {
            return callback(err);
        }
        if (typeof paraSubir === 'undefined') {
          return callback(new Error("No se encuentra el componente siguiente a #"+pos));
        }
        Modulos.update({formid:formId,id:paraSubir[0].id},{orden:pos}).exec(function(err){
          if (err) {
              return callback(err);
          }
          Modulos.update({formid:formId,id:paraBajar.id},{orden:pos+1}).exec(function(err){
            if (err) {
                return callback(err);
            }
            return callback(undefined); // funcionó
          });
        });
      });
    });
  },

  subir: function(formId,pos,callback) {
    Modulos.findOne({formid:formId,orden:pos}).exec(function(err,paraSubir){
      if (err) {
          return callback(err);
      }
      if (typeof paraSubir === 'undefined') {
        return callback(new Error("No se encuentra el componente #"+pos));
      }
      Modulos.find({formid:formId,orden:{'<':pos}}).sort('orden desc').limit(1).exec(function(err,paraBajar){
        if (err) {
            return callback(err);
        }
        if (typeof paraBajar === 'undefined') {
          return callback(new Error("No se encuentra el componente anterior a #"+pos));
        }
        Modulos.update({formid:formId,id:paraBajar[0].id},{orden:pos}).exec(function(err){
          if (err) {
              return callback(err);
          }
          Modulos.update({formid:formId,id:paraSubir.id},{orden:pos-1}).exec(function(err){
            if (err) {
                return callback(err);
            }
            return callback(undefined); // funcionó
          });
        });
      });
    });
  },

  renumerar: function(formId) {
      return this.query(`
        set @pos=1;
        UPDATE modulos set orden=@pos:=@pos+1
        WHERE formid=?
          AND orden>1
          AND orden<999
      `, [formId]);
  },
};
