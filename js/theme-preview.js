/* Lets you preview a theme with ?theme=a, ?theme=b or ?theme=c on any page.
   Your choice is remembered in this browser only. ?theme=reset clears it.
   The real, site-wide theme is set in css/theme.css. */
(function () {
  var allowed = { a: 1, b: 1, c: 1 };
  var pick = null;
  try {
    var q = new URLSearchParams(window.location.search).get('theme');
    if (q === 'reset') { localStorage.removeItem('fcs-theme'); }
    else if (q && allowed[q]) { pick = q; localStorage.setItem('fcs-theme', q); }
    else { var saved = localStorage.getItem('fcs-theme'); if (saved && allowed[saved]) pick = saved; }
  } catch (e) { /* storage blocked: preview just won't persist */ }
  if (!pick) return;
  var link = document.getElementById('theme-css');
  if (link) link.href = link.href.replace(/theme(-[abc])?\.css.*$/, 'theme-' + pick + '.css');
  document.documentElement.setAttribute('data-theme-preview', pick);
})();
