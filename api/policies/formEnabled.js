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
  req.config.enabled = (req.config.desde <= ahora && ahora <= req.config.hasta);

  if (req.config.enabled || (req.session && req.session.preview)) {
    // Está en período de validez o es preview
    return next();
  }

  if (!req.session) {
    // El acceso es público (y no estamos en período de validez)
    return res.view("error.ejs", {title:req.config.titulo, mensaje:"Formulario deshabilitado porque estamos fuera del período de validez"});
  }

  Recibidos.findOne({formid:req.formId,cedula:req.config.ci,borrado:false}).exec(function(err,recibido) {
    if (err) {
      return res.serverError(err);
    }

    if (!recibido) {
      return res.view("error.ejs", {title:req.config.titulo, mensaje:"Formulario deshabilitado porque estamos fuera del período de validez"});
    }

    // Continúo para que pueda ver el comprobante de inscripción
    return next();
  });
};
