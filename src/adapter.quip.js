const
  QUIP_CONTAINERS = 'article, .body.scrollable'
  QUIP_IGNORE_PAGES = [/.*api.*/i, /.*account.*/i, /.*about.*/i, /.*blog.*/i, /.*business.*/i]

function Quip() {
  if (!window.MutationObserver) return

  // Fix #151 by detecting when page layout is updated.
  // In this case, split-diff page has a wider layout, so need to recompute margin.
  var observer = new window.MutationObserver(function(mutations) {
    for (var i = 0, len = mutations.length; i < len; i++) {
      var mutation = mutations[i]
      if (~mutation.oldValue.indexOf('split-diff') ||
          ~mutation.target.className.indexOf('split-diff')) {
        return $(document).trigger(EVENT.LAYOUT_CHANGE)
      }
    }
  })

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true
  })
}

/**
 * Updates page layout based on visibility status and width of the Quiptree sidebar.
 */
Quip.prototype.updateLayout = function(sidebarVisible, sidebarWidth) {
  var $containers = $(QUIP_CONTAINERS)
   , spacing = 10
  $containers.stop().animate({'margin-right': sidebarVisible ? sidebarWidth - spacing : ''}, 'fast')
}

/**
 * Ignore to load extension on some pages.
 */
Quip.prototype.canLoadExtension = function() {

  for (var i = 0; i < QUIP_IGNORE_PAGES.length; i++) {
    var pattern = QUIP_IGNORE_PAGES[i]
    if (window.location.pathname.search(pattern) ==! -1)
      return false
    else if ($('footer').length && $('footer').html().search(pattern) ==! -1) // For quip.com homepage
      return false
  }
  return true
}


/**
 * Init Quip Api.
 * @param token(required) user access token
 * @param reload(required) reload quip object with new token
 * @param callback(quipApi: Quip Api object)
 */
Quip.prototype.initQuipApi = function(token, reload, callback) {

  var self = this
    , quipApi

  if (typeof self.quipApi === 'undefined' || reload === true)
  {
    var QuipApi = require('quip.Quip')

    try {
      self.quipApi = new QuipApi({accessToken: token})
      callback(null, self.quipApi)
    }
    catch (error) {
      callback(error)
    }
  }
  else {
    callback(null, self.quipApi)
  }

}

/**
 * Set Root Folder Id.
 * @param rootFolderId(required) set root folder id

 */
Quip.prototype.setRootFolderId = function(rootFolderId) {
  this.rootFolderId = rootFolderId
}

/**
 * Set User Id.
 * @param userId(required) set user id

 */
Quip.prototype.setUserId = function(userId) {
  this.userId = userId
}

/**
 * Fetches authenticated user.
 * @param token(required) user access token
 * @param reload(required) reload quip object with new token
 * @param callback(err: error, user: user object, alreadyAuthenticated: boolean)
 */
Quip.prototype.fetchAuthenticatedUser = function(token, reload, callback) {

  var self = this

  if (typeof self.user === 'undefined' || reload === true) {

    this.initQuipApi(token, reload, function(error, quipApi) {

      if (error) return callback(error)

      quipApi.usr.getAuthenticatedUser(function(error, user) {
        if (error) return callback(error)
        self.user = user
        callback(null, user, false)
      })

    })
  }
  else {
    callback(null, self.user, true)
  }

}

/**
 * Fetches tree.
 * @param token(required) user access token
 * @param parentFolderId(required) parent folder id
 * @param reload(required) reload quip object with new token
 * @param callback(err: error, tree: array (of arrays) of items)
 */
Quip.prototype.fetchData = function(token, parentFolderId, reload, callback) {

  var self = this

  this.initQuipApi(token, reload, function(error, quipApi) {

    if (error) return callback(error)
    parentFolderId = (parentFolderId === '#') ? self.rootFolderId : parentFolderId
    self.fetchTree(quipApi, parentFolderId, function(error, folders) {
      if (error) return callback(error)
      return callback(null, folders)
    })

  })

}

/**
 * Create a Folder Item.
 * @param folder(required) folder object
 * @param callback(item: folder item)
 */
Quip.prototype.createFolderItem = function(folder, callback)
{
  var item = new Object()
  item.id = (folder.id === this.rootFolderId) ? '#' : folder.id
  item.children = true
  item.li_attr = new Object()
  item.li_attr['data-color'] = folder.color ? 'color-' + folder.color : 'color-manila'
  item.li_attr['data-link-id'] = folder.id
  item.text = folder.title ? folder.title : 'Desktop'
  item.icon = 'tree'
  item.type = 'tree'
  callback(item)
}

/**
 * Create a Thread Item.
 * @param thread(required) thread object
 * @param callback(item: thread item)
 */
Quip.prototype.createThreadItem = function(thread, callback)
{
  var item = new Object()
  item.id = thread.id
  item.children = false
  item.a_attr = new Object()
  item.a_attr['data-click'] = 'open-document'
  item.a_attr['data-title'] = thread.title
  item.a_attr['data-id'] = thread.id
  item.a_attr['data-thread-id'] = thread.id
  item.a_attr['data-link-id'] = thread.link.split('/').pop()
  item.text = thread.title
  item.icon = 'blob'
  item.type = 'blob'
  callback(item)
}

/**
 * Fetches threads.
 * @param quipApi(required) quipApi Object
 * @param threadsIds(required) array of threads ids
 * @param callback(err: error, tree: array (of arrays) of items)
 */
Quip.prototype.fetchThreads = function(quipApi, threadsIds) {

  var self = this
    , threads = []
    , dfd = $.Deferred()

  if (threadsIds.length === 0) return dfd.resolve(threads)

  quipApi.th.getThreads({ids: threadsIds}, function(error, data) {

    Object.keys(data).forEach(function(key, index) {
      thread = data[key].thread
      self.createThreadItem(thread, function(item) {
        threads.push(item)
        if (index == Object.keys(data).length - 1) dfd.resolve(threads)
      })
    })
  })

  return dfd.promise()
}

/**
 * Fetches folders.
 * @param quipApi(required) quipApi Object
 * @param foldersIds(required) array of folders ids
 * @param callback(err: error, tree: array (of arrays) of items)
 */
Quip.prototype.fetchFolders = function(quipApi, foldersIds) {

  var self = this
    , folders = []
    , dfd = $.Deferred()

  if (foldersIds.length === 0) return dfd.resolve(folders)

  quipApi.fdr.getFolders({ids: foldersIds}, function(error, data) {

    Object.keys(data).forEach(function(key, index) {
      folder = data[key].folder
      self.createFolderItem(folder, function(item) {
        folders.push(item)
        if (index == Object.keys(data).length - 1) dfd.resolve(folders)
      })
    })

  })

  return dfd.promise()
}

/**
 * Fetches tree.
 * @param quipApi(required) quipApi Object
 * @param parentFolderId(required) array of folders ids
 * @param callback(err: error, tree: array (of arrays) of items)
 */
Quip.prototype.fetchTree = function(quipApi, parentFolderId, callback) {

  var self = this

  quipApi.fdr.getFolder({id: parentFolderId}, function(error, folder) {
    if (error) return callback(error)

    childrenThreads = folder.children.filter(function(obj) {
      return (obj.hasOwnProperty('thread_id'))
    })

    childrenFolders = folder.children.filter(function(obj) {
      return (obj.hasOwnProperty('folder_id') && !obj.hasOwnProperty('restricted'))
    })

    threadsIds = childrenThreads.map(function(obj) {
      return obj.thread_id
    })

    foldersIds = childrenFolders.map(function(obj) {
      return obj.folder_id
    })

    d1 = self.fetchThreads(quipApi, threadsIds)
    d2 = self.fetchFolders(quipApi, foldersIds)

    $.when(d1, d2).done(function(v1, v2) {
      callback(null, $.merge(v1, v2))
    })

  })

}
