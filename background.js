var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

chrome.browserAction.onClicked.addListener(function(tab) {
  _gaq.push(['_trackEvent', 'BrowserAction', 'click']);

  chrome.tabs.executeScript(tab.id, {
    file: 'lib/jquery.min.js',
    runAt: 'document_end'
  }, function() {
    chrome.tabs.executeScript(tab.id, {
      file: 'html5-outliner.js',
      runAt: 'document_end'
    }, function() {
      chrome.tabs.executeScript(tab.id, {
        file: 'outliner.js',
        runAt: 'document_end'
      }, function() {
        chrome.tabs.insertCSS(tab.id, {
          file: 'style.css',
          runAt: 'document_end'
        });
      });
    });
  });
});
