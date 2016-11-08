/**
 * Departamentos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	connection: 'Direcciones',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,
	migrate: 'safe',
	tableName: 'DEPARTAMENTO',
	attributes: {
		DeptoId: {
			type: 'integer',
			unique: true,
			primaryKey: true
		},
		DeptoNombre: 'string',
	},

};
