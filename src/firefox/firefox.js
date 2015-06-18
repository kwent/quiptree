var pageMod = require('sdk/page-mod')

pageMod.PageMod({
  include: '*.quip.com',

  contentScriptFile: ['./jquery.js',
                       './jquery-ui.js',
                       './jstree.js',
                       './keymaster.js',
                       './quip.min.js',
                       './quiptree.js'
                      ],

  contentStyleFile: ['./icomoon.css',
                       './jstree.css',
                       './quiptree.css'
                      ],

  contentScriptWhen: 'start'
})
