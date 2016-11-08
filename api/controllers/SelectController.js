/**
 * SelectController
 *
 * @description :: Server-side logic for managing select
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
 	load: function(param,resolve,reject) {
    param.m.options = [];
    try {
      JSON.parse(param.m.texto1).forEach(function(op){
        param.m.options.push({id:op,desc:op});
      });
      return resolve(undefined);
    } catch(err) {
      console.log("error parsing "+param.m.texto1);
      return reject(new Error(err));
    };
 	},
 };
