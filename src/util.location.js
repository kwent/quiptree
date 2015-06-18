$(document).ready(function() {
  // When navigating from non-document pages (i.e. Plateform / Root) to document page
  var href, hash
  function detectLocationChange() {
    if (location.href !== href || location.hash !== hash) {
      href = location.href
      hash = location.hash
      $(document).trigger(EVENT.LOC_CHANGE, href, hash)
    }
    setTimeout(detectLocationChange, 200)
  }
  detectLocationChange()
})
