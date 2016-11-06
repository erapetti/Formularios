$("ul.dropdown-menu li a").click(function(event) {
  event.preventDefault();
  // actualizo input
  $('#dd-'+$(this).attr('dd')).val( $(this).attr('data') );
  // actualizo etiqueta del botón
  $('#dropdownMenu'+$(this).attr('dd')).html( $(this).text() + ' <span class="caret"></span>');
});
