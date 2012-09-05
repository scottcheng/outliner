$(function() {
  if ($('#outliner-sidebar').length > 0) {
    return;
  }

  var $sidebar = $('<div />')
    .attr('id', 'outliner-sidebar')
    .addClass('hidden');  // slide in effect
  var $header = $('<div />')
    .attr('id', 'outliner-sidebar-header')
    .appendTo($sidebar);
  var $title = $('<div />')
    .attr('id', 'outliner-sidebar-title')
    .html('Outliner')
    .appendTo($header);
  var $contentWrapper = $('<div />')
    .attr('id', 'outliner-sidebar-content-wrapper')
    .appendTo($sidebar);
  var $content = $('<div />')
    .attr('id', 'outliner-sidebar-content')
    .html(HTML5Outline(document.body).asHTML(true))
    .appendTo($contentWrapper);
  $sidebar
    .appendTo('body')
    .removeClass('hidden');
});