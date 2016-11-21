/**
 * formEnabled
 *
 * @module      :: Policy
 * @description :: Valida que el formulario esté en el período de validez
 *
 */
module.exports = function(req, res, next) {
  
  if (req.config.hasta) {
    req.config.hasta.setHours(23);
    req.config.hasta.setMinutes(59);
    req.config.hasta.setSeconds(59);
  }

  var ahora = new Date();
  if (!(req.config.desde <= ahora && ahora <= req.config.hasta) && !req.session.preview) {
    return res.view("error.ejs", {title:req.config.titulo, mensaje:"Formulario deshabilitado porque estamos fuera del período de validez"});
  }

  return next();
};
