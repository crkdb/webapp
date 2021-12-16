$('.ui.accordion').accordion({exclusive: false});
$('table thead th.no-sort').data('sorter', false);
$('table').tablesorter({
  sortRestart: true
});