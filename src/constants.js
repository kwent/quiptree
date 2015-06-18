const
    PREFIX = 'quiptree'

  , STORE = {
    TOKEN    : 'quiptree.quip_access_token',
    STATES   : 'quiptree.states',
    REMEMBER : 'quiptree.remember',
    LAZYLOAD : 'quiptree.lazyload',
    HOTKEYS  : 'quiptree.hotkeys',
    WIDTH    : 'quiptree.sidebar_width',
    POPUP    : 'quiptree.popup_shown',
    SHOWN    : 'quiptree.sidebar_shown'
  }

  , DEFAULTS = {
    TOKEN    : '',
    REMEMBER : false,
    STATES : true,
    LAZYLOAD : false,
    // @ifdef SAFARI
    HOTKEYS  : '⌘+b, ⌃+b',
    // @endif
    // @ifndef SAFARI
    HOTKEYS  : '⌘+⇧+s, ⌃+⇧+s',
    // @endif
    WIDTH    : 253,
    POPUP    : false,
    SHOWN    : false
  }

  , EVENT = {
    TOGGLE        : 'quiptree:toggle',
    LOC_CHANGE    : 'quiptree:location',
    LAYOUT_CHANGE : 'quiptree:layout',
    REQ_START     : 'quiptree:start',
    REQ_END       : 'quiptree:end',
    OPTS_CHANGE   : 'quiptree:change',
    VIEW_READY    : 'quiptree:ready',
    VIEW_CLOSE    : 'quiptree:close'
  }
