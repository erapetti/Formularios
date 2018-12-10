$(document).ready(function() {
  if ($("#form").length) {
    formInit();
  } else if ($("#admin").length) {
    adminInit();
  }
});

/***********************************
 * form
 */
function formInit() {

  var bar = $('#bar');
  var percent = $('#percent');
  var status = $('#status');

  if (typeof bloqueado !== 'undefined') { // se carga en intro.ejs
    bloquear();
  } else {
    $('#ajaxForm input').prop('disabled',false);
    $('#ajaxForm select').prop('disabled',false);
    $('#form button#borrar').hide();
  }

  $('#ajaxForm').submit(function(e){
    $.ajaxSetup({
        type: 'POST',
        encType: 'multipart/form-data, charset=UTF-8',
        contentType: false,
        cache: false,
        processData: false,
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
        complete: function(xhr,st) {
          var message = "ERROR: respuesta del servidor vacía o inentendible";
          try {
            message = JSON.parse(xhr.responseText).message;
          } catch(e) {
          }
          if (xhr.responseText.indexOf('OK')!=-1) {
            openDialog("Error al enviar el formulario", message);
            mensaje(message,red);
          } else {
            openDialog("Formulario enviado con éxito", message);
            mensaje('','');
            bloquear();
            $('#comprobante').show();
            $('#ajaxForm [type=reset]').hide();
          }
        },
    });

    if (validate( $(this) )) {
      var FD = new FormData(this);
      FD.append('submit', 'enviar');
      $.ajax({data:FD});
    }
    e.preventDefault();
  });

  $('form textarea').each(function() {
    autogrow($(this));
  });

  $('#borrar').click(function() {
    if (confirm("¿Desea anular su formulario?")) {
      var formId = location.search.substr(1).match(/id=(\d+)/)[1];
      var recordId = $('#registro-0').val();
      $.post("borrar?id="+formId,{recordId:recordId})
      .done(function(data){
        openDialog("Acción realizada", typeof data.message !== "undefined" ? data.message : "ERROR");
      })
      .fail(function(rawdata){
        var data;
        try {
          data = JSON.parse(rawdata.responseText);
        } catch(e) {
        }
        openDialog("ERROR", typeof data !== "undefined" && typeof data.message !== "undefined" ? data.message : rawdata.statusText);
      });
    }
  });
}; // formInit

function autogrow(obj) {
  var matches = obj.val().match(/\n/g);
  var breaks = matches ? matches.length : 2;
  obj.attr('rows',breaks + 1);
};

function mensaje(texto,color) {
  $('#status').html(texto);
  $('#status').css('color',color);
};

function bloquear() {
  $('#cancelar').hide();
  $('#borrar').show();
  $('#ajaxForm [type=submit]').hide();
  $('#ajaxForm').prop('disabled',true);
  $('#ajaxForm input').prop('disabled',true);
  $('#ajaxForm select').prop('disabled',true);
  $('#ajaxForm *').css('background-color','#f2f2f2');
  $("#ajaxForm a").css('display','none');
  $("body").css("cursor", "default");
};

/* Los validadores hay que agregarlos en AdminController */

function validate_nop(item) {
  return true;
};

function validate_novacio(item) {
  return (item.value && item.value!=="");
};

function validate_numero(item) {
  var re = /^[0-9]+$/;
  return re.test(item.value);
};

function validate_correo(item) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(item.value);
};

function validate_edad(item,param) {
  var desde = param.search(/^\d+/);
  var hasta = param.search(/\d+$/);
  if (!desde || !hasta) {
    return false;
  }

  try {
    var ageDifMs = Date.now() - Date.parse(item);
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    var age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return (age>=desde && age>=hasta);
  } catch(e) {
    return false;
  }
};

function validate() {
        mensaje('','black');
        var errores=0;
        $('#ajaxForm *').filter(':input,select').each(function(index,item) {
          if (item.getAttribute("data-validate") && (item.getAttribute("data-optional")!=='true' || item.value && item.value!=="")) {
            // llamo a la función de validación
            if (!window["validate_"+item.getAttribute("data-validate")](item, item.getAttribute("param"))) {
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

/***********************************
 * admin
 */
function adminInit() {
  // acciones genéricas del formulario:
  $('#admin a[data]').click(function(event){
    event.preventDefault();
    if (! $(this).hasClass('disabled')) {
      var url = $(this).attr('dest')+'?formId='+$(this).attr('data');
      $.getJSON(url)
        .done(function(data){
          openDialog("Acción realizada", typeof data.message !== "undefined" ? data.message : "ERROR");
        })
        .fail(function(rawdata){
          var data;
          try {
            data = JSON.parse(rawdata.responseText);
          } catch(e) {
          }
          openDialog("ERROR", typeof data !== "undefined" && typeof data.message !== "undefined" ? data.message : rawdata.statusText);
        });
    }
  });
  // accion preview va separada porque abre un popup
  $('#admin a[preview]').click(function(event){
    event.preventDefault();
    var formid = $(this).attr('preview');
    $('#admin #preview iframe').attr('src', $(this).attr('dest')+'?formId='+formid);
  });
  // accion edit va separada porque abre un popup
  $('#admin a[edit]').click(function(event){
    event.preventDefault();
    var formid = $(this).attr('edit');
    var titulo = $('#admin tr[formid='+formid+'] td:nth-child(2)').html().trim();
    var desde = $('#admin tr[formid='+formid+'] td:nth-child(3)').attr('date').trim();
    var hasta = $('#admin tr[formid='+formid+'] td:nth-child(4)').attr('date').trim();
    var publico = $('#admin tr[formid='+formid+']').attr('_publico');
    var multiple = $('#admin tr[formid='+formid+']').attr('_multiple');
    $('#myModal .modal-body input[name=formId]').val(formid);
    $('#myModal .modal-body input[name=titulo]').val(titulo);
    $('#myModal .modal-body input[name=desde]').val(desde);
    $('#myModal .modal-body input[name=hasta]').val(hasta);
    $('#myModal .modal-body input[name=publico]').prop("checked",(publico == "on"));
    $('#myModal .modal-body input[name=multiple]').prop("checked",(multiple == "on"));
  });
  // submit del popup de edit
  $('#myModal #modalSubmit').click(function(event){
    var formid = $('#myModal .modal-body input[name=formId]').val();
    var titulo = $('#myModal .modal-body input[name=titulo]').val();
    var desde = $('#myModal .modal-body input[name=desde]').val();
    var hasta = $('#myModal .modal-body input[name=hasta]').val();
    var publico = $('#myModal .modal-body input[name=publico]').prop("checked") ? "on" : "";
    var multiple = $('#myModal .modal-body input[name=multiple]').prop("checked") ? "on" : "";
    $.post("edit", {formId:formid,titulo:titulo,desde:desde,hasta:hasta,publico:publico,multiple:multiple})
      .done(function() {
        window.location.assign('');
      })
      .fail(function(data) {
        var mensaje = "ERROR";
        try {
          mensaje = JSON.parse(data.responseText).message;
        } catch(e) {
        }
        $('#myModal #message').html(mensaje).show();
      });
  });
  // oculto el div con el mensaje de error al abrir el popup
  $('#myModal').on('show.bs.modal', function() {
    $('#myModal #message').hide();
  });

}; // adminInit

/***********************************
 * layout
 */
function openDialog(title,text){
  $('#dialog-message-title').html(title);
  $('#dialog-message-body').html(text);
  $('#dialog-message').modal();
};
$('#dialog-message').on('hidden.bs.modal', function() {
  window.location.assign(window.location.href.replace('&multiple=enviar',''));
});

/***********************************
 * modedit
 */
 $(document).ready(function() {
   if ($("#float").length) {
     $('#float').hide();
     $('.modulo').click(function(e){
       e.preventDefault();
       if ($('#float').offset().top == $(this).offset().top) {
         $('#float').toggle();
       } else {
         $('#float').show();
       }
       $('#float').offset( {top:$(this).offset().top,left:0} );
       $('#float').attr('data-orden', $(this).attr('data-orden'));
     });
     $('#float a').click(function(){
       window.location.assign("../admin/modedit?formId="+$(this).attr('formId')+"&orden="+$(this).parent().attr('data-orden')+"&action="+$(this).attr('title'));
     });
   }
   $('#admin_modedit textarea').summernote({toolbar:
     [
       ['style', ['bold', 'italic', 'underline']],
       ['fontsize', ['fontsize']],
       ['color', ['color']],
       ['para', ['ul', 'ol', 'paragraph']],
       ['insert',['picture','link','table','hr']],
       ['misc',['codeview']]
     ]
   });
 });
