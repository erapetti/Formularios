/**
 * DenominacionesCargos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'Personal',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  autoPK: false,
  migrate: 'safe',
  tableName: 'DENOMINACIONES_CARGOS',
  attributes: {
          DenomCargoId: {
                  type: 'integer',
                  primaryKey: true
          },
          DenomCargoDesc: 'string',
          DenomCargoActivo: 'integer',
  },

  misCargos: function(perci,callback) {
    return this.query(`
      select DenomCargoId,DenomCargoDesc,DenomCargoActivo
      from RELACIONES_LABORALES
      join Personas.PERSONASDOCUMENTOS
        on perid=personalperid and paiscod='UY' and doccod='CI'
      join PUESTOS
        using (puestoid)
      join DENOMINACIONES_CARGOS
        using (DenomCargoId)
      where perdocid=?
        AND (RelLabCeseFchReal is null OR RelLabCeseFchReal='1000-01-01' OR RelLabCeseFchReal>now())
        AND (RelLabFchIniActividades is null OR RelLabFchIniActividades='1000-01-01' OR RelLabFchIniActividades<now())
        AND (PuestoFchDesdeVigencia is null OR PuestoFchDesdeVigencia='1000-01-01' OR PuestoFchDesdeVigencia<now())
        AND (PuestoFchHastaVigencia is null OR PuestoFchHastaVigencia='1000-01-01' OR PuestoFchHastaVigencia>now())
      group by DenomCargoId
    `,
    [perci],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      if (result===null) {
        return new Error("No hay cargos asociados a esta persona",undefined);
      }
      return callback(undefined, (result===null ? undefined : result));
    });
  },
};
