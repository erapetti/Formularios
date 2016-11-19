/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  if (typeof req.session === 'object' && req.session.Sesionesid > 0) {
    // ya está autenticado
    return next();
  }

  if (sails.config.environment === "development") {
    //session = {Sesionesid:1,Userid:'u10121248',Dependid:1023,Lugarid:1023};
    //session = {Sesionesid:1,Userid:'u13683344',Dependid:1023,Lugarid:1023};
    //session = {Sesionesid:1,Userid:'u17488617',Dependid:1023,Lugarid:1023};
    //session = {Sesionesid:1,Userid:'u18753938',Dependid:5830,Lugarid:5830};
    //session = {Sesionesid:1,Userid:'u33784415',Dependid:5830,Lugarid:5830};
    //session = {Sesionesid:1,Userid:'u26827767',Dependid:5830,Lugarid:5830};
    req.session = {Sesionesid:1,Userid:'u19724241',Dependid:1023,Lugarid:1023};
    return next();
  }

  if (typeof req.cookies.SESION !== "string") {
    return res.forbidden(new Error("Debe iniciar sesión en el portal de servicios"));
  }

  var sessionid = req.cookies.SESION.replace(/[+ ]/g,'');
console.log(url);
  var url = req.url.substr(1); // saco la / inicial
console.log(url);
  url = url.replace(/\?.*/, '');
console.log(url);
  if (req.param('id')) {
    url = url + "?id=" + req.param('id');
  }
console.log(url);

  wsPortal.getSession(sessionid, url, function(err,session) {
    if (err) {
      sails.log("forbidden", req.url, err);
      return res.forbidden(err);
    }

    req.session = session;
    return next();
  });
};
