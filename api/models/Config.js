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
    },
    desde: 'datetime',
    hasta: 'datetime',
    titulo: 'string',
    modulos: {
      collection: 'modulos',
      via: 'formid'
    }
  }
};
