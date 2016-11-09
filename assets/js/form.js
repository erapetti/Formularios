$(document).ready(function() {

  var bar = $('#bar');
  var percent = $('#percent');
  var status = $('#status');

  // inicialización de los dropdown-menu
  $("ul.dropdown-menu").each(function(index,obj){
    var campo = $(this).attr('dd');
    var val = $('#dd-'+campo).val();
    if (typeof val !== 'undefined' && val!=="") {
      var texto = $("ul.dropdown-menu[dd="+campo+"] li a[data="+val+"]").text();
      // actualizo etiqueta del botón
      $('#btn-dd-'+campo).html( texto + ' <span class="caret"></span>');
    }
  });
  // función para actualizar los dropdown-menu cuando el usuario selecciona una opción
  $("ul.dropdown-menu li a").click(function(event) {
    event.preventDefault();
    // actualizo input
    $('#dd-'+$(this).attr('dd')).val( $(this).attr('data') );
    // actualizo etiqueta del botón
    $('#btn-dd-'+$(this).attr('dd')).html( $(this).text() + ' <span class="caret"></span>');
  });

  if (typeof bloqueado !== 'undefined') { // se carga en intro.ejs
    bloquear();
  } else {
    $('#myForm input').prop('disabled',false);
    $('#myForm .dropdown button').prop('disabled',false);
  }

  $('#myForm').ajaxForm({
    beforeSubmit: validate,
    beforeSend: function() {
      $("body").css("cursor", "progress");
      var percentVal = '0%';
      bar.width(percentVal)
      percent.html(percentVal);
    },
    uploadProgress: function(event, position, total, percentComplete) {
      var percentVal = percentComplete + '%';
      bar.width(percentVal)
      percent.html(percentVal);
      $('#progress').show();
    },
    success: function() {
      var percentVal = '100%';
      bar.width(percentVal)
      percent.html(percentVal);
    },
    complete: function(xhr) {
      $('#dialog-message').html(xhr.responseText.replace('OK','').replace('ERROR: ',''));
      $('#dialog-message').prop('title', xhr.responseText.indexOf('OK')==-1 ? "ERROR" : "Formulario enviado con éxito");
      $(function() {
        $('#dialog-message').dialog({
          modal: true,
          buttons: {
                  Cerrar: function() {
                          $(this).dialog("close");
                          window.location.assign('');
                  },
          },
          close: function() {
          }
        });
      });
      mensaje('','');
      bloquear();
      if (xhr.responseText.indexOf('OK')>-1) {
              $('#comprobante').show();
              $('#myForm [type=reset]').hide();
      }
    }
  });
}); //document ready

function mensaje(texto,color) {
        $('#status').html(texto);
        $('#status').css('color',color);
};
function show(que) {
        que.fadeIn('slow');
};
function bloquear() {
  $("#cancelar").hide();
  $('#myForm [type=submit]').hide();
  $('#myForm').prop('disabled',true);
  $('#myForm input').prop('disabled',true);
  $('#myForm .dropdown button').prop('disabled',true);
  $('#myForm *').css('background-color','#f2f2f2');
  $("#myForm a").css('display','none');
  $("body").css("cursor", "default");
};
function validate_novacio(item) {
  return (item.value && item.value!=="");
};
function validate_numero(item) {
  var re = /^[0-9]+$/;
  return (re.test(item.value));
};
function validate() {
        mensaje('','black');
        var errores=0;
        $('#myForm *').filter(':input').each(function(index,item) {
          if (item.getAttribute("validate") && (item.getAttribute("optional")!=='true' || item.value && item.value!=="")) {
            // llamo a la función de validación
            if (!window["validate_"+item.getAttribute("validate")](item)) {
              errores+=1;
              $("#btn-"+$(item).attr("id")).addClass("red");
              $(item).addClass("red");
            } else {
              $("#btn-"+$(item).attr("id")).removeClass("red");
              $(item).removeClass("red");
            }
          }
        });
        if (errores>1) {
          mensaje("Debe corregir los "+errores+" errores indicados con color rojo en el formulario","red");
          return false;
        } else if (errores==1) {
          mensaje("Debe corregir el error indicado con color rojo en el formulario","red");
          return false;
        }
        mensaje("Espere mientras se ingresa la solicitud....",'');
        return true;
};
