function TreeView($dom, store, adapter) {
  this.$view = $dom.find('.quiptree_treeview')
  this.store = store
  this.adapter = adapter
  this.firstLoading = true
  this.$view
    .find('.quiptree_view_body')
    .on('click.jstree', '.jstree-open>a', function() {
      $.jstree.reference(this).close_node(this)
    })
    .on('click.jstree', '.jstree-closed>a', function() {
      $.jstree.reference(this).open_node(this)
    })
    .on('click', function(event) {
      var $target = $(event.target)

      // handle icon click
      if ($target.is('i.jstree-icon')) $target = $target.parent()

      if (!$target.is('a.jstree-anchor')) return
    })
}

TreeView.prototype.initTree = function(token, reload, callback) {
  var self = this
    , treeContainer = self.$view.find('.quiptree_view_body')
    , states = self.store.get(STORE.STATES)

  treeContainer.jstree({
    core : { multiple: false, themes : { responsive : false },
      data : function(folder, cb) {
        folder.id = self.firstLoading ? '#' : folder.id
        self.firstLoading = false
        self.adapter.fetchData(token, folder.id, reload, function(error, tree) {
          cb(tree)
          callback(null, error)
        })
      }
    },
    plugins : states ? ['wholerow', 'state', 'search'] : ['wholerow', 'search']
  })
}

TreeView.prototype.search = function(value) {
  var self = this
    , treeContainer = self.$view.find('.quiptree_view_body')
    , tree = treeContainer.jstree(true)

  tree.search(value)
}

TreeView.prototype.syncSelection = function() {
  var tree = this.$view.find('.quiptree_view_body').jstree(true)
    , linkId = location.pathname.substring(1)

  if (!tree) return

  data = tree.get_json(null, {no_state: true, no_data: false})

  this.searchObjViaLinkId(linkId, tree, data, function(error, nodeId) {

    if (error) return

    if (nodeId) {
      tree.deselect_all()
      tree.select_node(nodeId.id)
      if (nodeId.icon === 'tree') {
        tree.open_node(nodeId.id)
      }
    }
  })
}

TreeView.prototype.searchObjViaLinkId = function(linkId, tree, data, callback) {

  var self = this

  Object.keys(data).forEach(function(key, index) {

    obj = data[key]

    if (obj.icon === 'tree') {
      if (obj.li_attr['data-link-id'] === linkId) {
        return callback(null, obj)
      }
      else {
        if (obj.icon === 'tree') {
          self.searchObjViaLinkId(linkId, tree, obj.children, callback)
        }
      }
    }
    else {
      if (obj.a_attr['data-link-id'] === linkId) {
        return callback(null, obj)
      }
    }
  })
}
