$(document).ready(function() {

  var bar = $('#bar');
  var percent = $('#percent');
  var status = $('#status');

  // actualización de los dropdown-menu
  $("ul.dropdown-menu li a").click(function(event) {
    event.preventDefault();
    // actualizo input
    $('#dd-'+$(this).attr('dd')).val( $(this).attr('data') );
    // actualizo etiqueta del botón
    $('#btn-dd-'+$(this).attr('dd')).html( $(this).text() + ' <span class="caret"></span>');
  });

  if (bloqueado) { // se carga en intro.ejs
    bloquear();
  } else {
    $('#myForm input').prop('disabled',false);
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
  $('#myForm [type=submit]').hide();
  $('#myForm input').prop('disabled',true);
  $("ul.dropdown-menu li a").click(function(){});
  $('#myForm *').css('background-color','#eee');
  $("body").css("cursor", "default");
  $("#cancelar").hide();
};
function validate_asignatura(item) {
  if (!item.value || item.value==="") {
    return false;
  }
  return true;
};
function validate_numero(item) {
  var re = /^[0-9]+$/;
  if (!re.test(item.value)) {
    return false;
  }
  return true;
};
function validate() {
        mensaje('','black');
        var errores=0;
        $('#myForm *').filter(':input').each(function(index,item) {
          if (item.getAttribute("validate") && !item.readOnly) {
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
