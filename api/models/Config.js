/**
 * Config.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'config',
  migrate: 'alter',
  autoPK: false,
  attributes: {
    formid: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
    },
    desde: 'date',
    hasta: 'date',
    titulo: 'string',
    modulos: {
      collection: 'modulos',
      via: 'formid'
    },
  },

  recibidos: function(callback) {
    return this.query(`
      SELECT formid,count(*) cant
      FROM recibidos
      GROUP BY formid
    `,
    [],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      if (result===null) {
        return new Error("No se pueden obtener los formularios recibidos",undefined);
      }
      var cantidad = [];
      result.forEach(function(item){
        cantidad[item.formid] = item.cant;
      })
      return callback(undefined, cantidad);
    });
  },
};
