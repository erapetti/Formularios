/**
 * Dependencias.js
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
  tableName: 'DEPENDENCIAS',
  identity: 'Dependencias',
  attributes: {
          DependId: {
                  type: 'integer',
                  primaryKey: true
          },
          DependDesc: 'string',
          DependNom: 'string',
          StatusId: 'integer',
  },

  misDependencias: function(perci,callback) {
    return this.query(`
      SELECT DependId,d.DependDesc,d.DependNom,d.StatusId
      FROM DEPENDENCIAS d
      JOIN (

        SELECT DependId
        FROM Personal.as400
        WHERE cedula=?
        GROUP BY DependId

        UNION

        SELECT SillaDependId DependId
        FROM Personal.RELACIONES_LABORALES
        JOIN Personal.SILLAS
          USING (SillaId)
        JOIN Personas.PERSONASDOCUMENTOS
          ON perid=personalperid AND paiscod='UY' AND doccod='CI'
        WHERE perdocid=?
          AND RelLabAnulada<>1
        GROUP BY SillaDependId

      ) TMP

      USING (DependId)
      WHERE StatusId=1
      GROUP BY DependId;
    `,
    [perci,perci,perci],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      if (result===null) {
        return new Error("No hay dependencias asociadas a esta persona",undefined);
      }
      return callback(undefined, (result===null ? undefined : result));
    });
  },
};
