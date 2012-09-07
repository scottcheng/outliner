var shrinkBody = function() {
  $('body').css({
    marginLeft: 285  // 280?
  });
};

var expandBody = function() {
  $body.css({
    marginLeft: 0
  });
};

var showSidebar = function() {
  $('#outliner-sidebar').css({
    left: 0
  });
};

var hideSidebar = function() {
  $sidebar.css({
    left: -280
  });
};

$(function() {
  if ($('#outliner-sidebar').length > 0) {
    showSidebar();
    shrinkBody();
    return;
  }

  shrinkBody();

  var $sidebar = $('<div />')
    .attr('id', 'outliner-sidebar');
  var $header = $('<div />')
    .attr('id', 'outliner-sidebar-header')
    .appendTo($sidebar);
  var $title = $('<div />')
    .attr('id', 'outliner-sidebar-title')
    .html('Outliner')
    .appendTo($header);
  var $closeBtn = $('<div />')
    .attr({
      id: 'outliner-sidebar-close-btn',
      title: chrome.i18n.getMessage('closeBtnTitle')
    })
    .click(function() {
      hideSidebar();
      expandBody();
    }).appendTo($header);
  var $contentWrapper = $('<div />')
    .attr('id', 'outliner-sidebar-content-wrapper')
    .appendTo($sidebar);
  var $content = $('<div />')
    .attr('id', 'outliner-sidebar-content')
    .html(HTML5Outline(document.body).asHTML(true))
    .appendTo($contentWrapper);

  var $body = $('body');
  var top = window.parseInt($body.css('padding-top'))
          + window.parseInt($body.css('margin-top'));

  $sidebar
    .css('top', top)
    .appendTo($body);
  showSidebar();
});