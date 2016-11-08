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
  }
};
