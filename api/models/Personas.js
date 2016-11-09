/**
 * Personas.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'Personas',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  autoPK: false,
  migrate: 'safe',
  attributes: {
    perid: 'integer',
    pernombrecompleto: 'string',
  },

  nombre: function(perci,callback) {
    return this.query(`
      SELECT perid,pernombrecompleto
      FROM PERSONAS
      JOIN PERSONASDOCUMENTOS
      USING (PerId)
      WHERE PAISCOD='UY'
        AND DOCCOD='CI'
        AND PERDOCID=?
      LIMIT 1
    `,
    [perci],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      if (result===null) {
        return new Error("No se pueden obtener los datos de la persona",undefined);
      }
      return callback(undefined, (result===null ? undefined : result[0]));
    });
  },

  telefono: function(perci,callback) {
    return this.query(`
      SELECT perid,PerTelNro
      FROM PERSONASDOCUMENTOS
      JOIN PERSONASTELEFONOS
      USING (PerId)
      WHERE PAISCOD='UY'
        AND DOCCOD='CI'
        AND PERDOCID=?
        AND PerTelNro LIKE '09%'
      ORDER BY PerTelId DESC
      LIMIT 1
    `,
    [perci],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      return callback(undefined, (result===null ? undefined : result[0]));
    });
  },

  correo: function(perci,callback) {
    return this.query(`
      SELECT perid,PerMailDir
      FROM PERSONASDOCUMENTOS
      JOIN PERSONASMAILS
      USING (PerId)
      WHERE PAISCOD='UY'
        AND DOCCOD='CI'
        AND PERDOCID=?
      ORDER BY PerMailId DESC
      LIMIT 1
    `,
    [perci],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      return callback(undefined, (result===null ? undefined : result[0]));
    });
  },


};
