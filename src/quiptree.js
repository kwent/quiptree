$(document).ready(function() {
  var store = new Storage()

  parallel(Object.keys(STORE), setDefault, loadExtension)

  function setDefault(key, cb) {
    var storeKey = STORE[key]
    var local = storeKey === STORE.TOKEN
    store.get(storeKey, local, function(val) {
      store.set(storeKey, val == null ? DEFAULTS[key] : val, local, cb)
    })
  }

  function loadExtension() {
    var $html     = $('html')
      , $document = $(document)
      , $dom      = $(TEMPLATE)
      , $sidebar  = $dom.find('.quiptree_sidebar')
      , $views    = $sidebar.find('.quiptree_view')
      , adapter   = new Quip()
      , optsView  = new OptionsView($dom, store)
      , helpPopup = new HelpPopup($dom, store)
      , treeView  = new TreeView($dom, store, adapter)
      , errorView = new ErrorView($dom, store)
      , hasError  = false

    if (adapter.canLoadExtension() === false) return

    $sidebar
      .appendTo($('body'))
      .width(parseFloat(store.get(STORE.WIDTH)))
      .resizable({ handles: 'w', minWidth: DEFAULTS.WIDTH })
      .resize(layoutChanged)

    createNavbar()
    createSearch()

    $(window).resize(function(event) { // handle zoom
      if (event.target === window) layoutChanged()
    })

    key.filter = function() { return $toggler.is(':visible') }
    key(store.get(STORE.HOTKEYS), toggleSidebarAndSave)

    ;[treeView, errorView, optsView].forEach(function(view) {
      $(view)
        .on(EVENT.VIEW_READY, function(event) {
          if (this !== optsView) $document.trigger(EVENT.REQ_END)
          showView(this.$view)
        })
        .on(EVENT.VIEW_CLOSE, function() {
          showView(hasError ? errorView.$view : treeView.$view)
        })
        .on(EVENT.OPTS_CHANGE, optionsChanged)
    })

    $document
      .on(EVENT.REQ_START, function() {
        $toggler.hide()
        $loader.show()
      })
      .on(EVENT.REQ_END, function() {
        $loader.hide()
        $toggler.show()
      })
      .on(EVENT.LOC_CHANGE, createNavbar)
      .on(EVENT.LAYOUT_CHANGE, layoutChanged)
      .on(EVENT.TOGGLE, toggledSidebar)

    return tryLoadTree()

    function createNavbar() {
      $navbar   = $('.thread-document nav')
      $navbar = ($navbar.length === 0) ? $('.folder nav') : $navbar
      if($navbar.find('.quiptree_loader').length === 0)
        $navbar.prepend('<span class="quiptree_loader button" style="display:none""></span>')
      if($navbar.find('.quiptree_toggle').length === 0)
        $navbar.prepend('<span class="quiptree_toggle button" style="display:none"></span>')
      $toggler  = $navbar.find('.quiptree_toggle')
      $loader  = $navbar.find('.quiptree_loader')
      $toggler.click(toggleSidebarAndSave)
      toggledSidebar()
      $toggler.show()
      treeView.syncSelection()
    }

    function createSearch() {
      var to = false;
      $('.quiptree_view_header input[type=text]').keyup(function () {
        if(to) { clearTimeout(to) }
        to = setTimeout(function () {
          var v = $('.quiptree_view_header input[type=text]').val()
          treeView.search(v)
        }, 250)
      })
    }

    function optionsChanged(event, changes) {
      var reload = false
      Object.keys(changes).forEach(function(storeKey) {
        var value = changes[storeKey]
        switch (storeKey) {
          case STORE.TOKEN:
            reload = true
            break
          case STORE.HOTKEYS:
            key.unbind(value[0])
            key(value[1], toggleSidebar)
            break
        }
      })
      if (reload) tryLoadTree(true)
    }

    function tryLoadTree(reload) {
      var remember = store.get(STORE.REMEMBER)
        , shown = store.get(STORE.SHOWN)
        , lazyload = store.get(STORE.LAZYLOAD)
        , token = store.get(STORE.TOKEN)

      $toggler.show()
      helpPopup.show()

      if (remember && shown) toggleSidebar(true)

      if (!lazyload || isSidebarVisible() || reload === true) {

        $document.trigger(EVENT.REQ_START)

        adapter.fetchAuthenticatedUser(token, reload, function(error, user, alreadyAuthenticated) {

          if (error) {
            error.needAuth = true
            errorView.show(error)
          }
          else if (!alreadyAuthenticated) {
            adapter.setRootFolderId(user.desktop_folder_id)
            adapter.setUserId(user.id)
            showView(treeView.$view)
            treeView.initTree(token, reload, function(error, success) {
              if (error) errorView.show(error)
              treeView.syncSelection()
            })
          }

          $document.trigger(EVENT.REQ_END)
        })
      }
    }

    function showView(view) {
      $views.removeClass('current')
      view.addClass('current')
    }

    function toggleSidebarAndSave() {
      store.set(STORE.SHOWN, !isSidebarVisible(), function() {
        toggleSidebar()
        if (isSidebarVisible()) {
          tryLoadTree()
        }
      })
    }

    function toggleSidebar(visibility) {
      if (visibility !== undefined) {
        if (isSidebarVisible() === visibility) return
        toggleSidebar()
      }
      else {
        $html.toggleClass(PREFIX)
        $document.trigger(EVENT.TOGGLE, isSidebarVisible())
      }
    }

    function toggledSidebar() {
      layoutChanged()
      $toggler.toggleClass('toggled', isSidebarVisible())
    }

    function layoutChanged() {
      var width = $sidebar.width()
      $sidebar.css('left', '')
      adapter.updateLayout(isSidebarVisible(), width)
      store.set(STORE.WIDTH, width)
    }

    function isSidebarVisible() {
      return $html.hasClass(PREFIX)
    }
  }
})
