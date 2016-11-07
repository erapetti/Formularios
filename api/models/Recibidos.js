/**
 * Recibidos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'config',
  migrate: 'alter',
  attributes: {
    formid: {
      model: 'config',
      required: true,
    },
    cedula: 'string',
    ip: 'string',
    nombre: 'string',
    correo: 'string',
    telefono: 'string',
    json: 'json',
  },
};
