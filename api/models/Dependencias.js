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

        SELECT DependId
        FROM Personal.RELACIONES_LABORALES
        JOIN Personas.PERSONASDOCUMENTOS
          ON perid=personalperid and paiscod='UY' and doccod='CI'
        JOIN Personal.PUESTOS
          USING (puestoid)
        WHERE perdocid=?
          AND (PuestoFchHastaVigencia is null OR PuestoFchHastaVigencia='1000-01-01' OR PuestoFchHastaVigencia>now())
          AND (RelLabCeseFchReal is null OR RelLabCeseFchReal='1000-01-01' OR RelLabCeseFchReal>now())
        GROUP BY DependId

      ) TMP

      USING (DependId)
      WHERE StatusId=1
      GROUP BY DependId;
    `,
    [perci,perci],
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
