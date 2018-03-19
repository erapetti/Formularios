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
      SELECT perid,email PerMailDir
      FROM sso.sso
      JOIN PERSONASDOCUMENTOS
      WHERE UserId = concat('u',?)
        AND activa='S'
        AND PAISCOD='UY'
        AND DOCCOD='CI'
        AND PERDOCID=?
      UNION
      (SELECT perid,PerMailDir
      FROM PERSONASDOCUMENTOS
      JOIN PERSONASMAILS
      USING (PerId)
      WHERE PAISCOD='UY'
        AND DOCCOD='CI'
        AND PERDOCID=?
      ORDER BY PerMailId DESC)
      LIMIT 1
    `,
    [perci,perci,perci],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      return callback(undefined, (result===null ? undefined : result[0]));
    });
  },

  credencial: function(perci,callback) {
    return this.query(`
      SELECT PD2.perid,PD2.PerDocId
      FROM PERSONASDOCUMENTOS PD1
      JOIN PERSONASDOCUMENTOS PD2
      USING (PerId)
      WHERE PD1.PAISCOD='UY'
        AND PD1.DOCCOD='CI'
        AND PD1.PERDOCID=?
        AND PD2.PAISCOD='UY'
        AND PD2.DOCCOD='CRE'
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
