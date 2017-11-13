/**
 * findForm
 *
 * @module      :: Policy
 * @description :: Busca el formulario indicado de parámetro y carga los datos
 *                 en req.config.
 *                 Usa el parámetro id o el formId
 *
 */
module.exports = function(req, res, next) {

  req.formId = req.param('id') || req.param('formId');
  if (!(req.formId>0)) {
    return res.serverError(new Error("Parámetros incorrectos"));
  }

  Config.findOne({formid:req.formId}).populate('modulos',{sort:'orden'}).exec(function(err,config){
    if (err) {
      return res.serverError(err);
    }

    if (!config) {
      return res.serverError(new Error("No existe el formulario solicitado"));
    }

    req.config = config;
    if (!req.config.publico){
      try {
        req.config.Userid = req.session.Userid;
        req.config.Dependid = req.session.Dependid;
        req.config.Lugarid = req.session.Lugarid;
        req.config.ci = req.session.Userid.substr(1);
      } catch(e) {
        return res.serverError(new Error("Reinicie su sesión en el Portal de Servicios y vuelva a intentar."));
      }
    }

    return next();
  });
};
