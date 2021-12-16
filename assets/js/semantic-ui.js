(function () {
  $('.ui.accordion').accordion({exclusive: false});

  var disableSortText = '-1'.trim().toLowerCase();
  $('table thead th.no-sort').data('sorter', false);
  $('table').tablesorter({
    sortRestart: true,
    textExtraction: function(node) {
      var dataText = $(node).attr('data-text');
      if (dataText) {
        return dataText;
      }
      return $(node).text();
    },
    textSorter: function(a, b, dir, colIndex, table) {
      console.log(a, b);
      if (a === disableSortText) {
        return (dir) ? 1 : -1;
      } 
      if (b === disableSortText) {
        return (dir) ? -1 : 1;
      }
      return $.tablesorter.sortText(a, b, dir, colIndex, table);
    },
    numberSorter: function(a, b, dir, maxColValue) {
      if (dir) {
        if (a === -1) {
          a = maxColValue + 1;
        }
        if (b === -1) {
          b = maxColValue + 1;
        }
      }
      return (dir) ? (a - b) : (b - a);
    }
  });
  
  $('table input[type="checkbox"]').on('click', function(e) {
    var tr = $(e.currentTarget).parents('tr');
    var td = tr.find('td');
    if (e.target.checked) {
      tr.removeClass('sort-disabled');
      td.attr('data-text', null);
    } else {
      tr.addClass('sort-disabled');
      td.attr('data-text', disableSortText);
    }
  
    $('table').trigger('update', [false]);
  });
})();