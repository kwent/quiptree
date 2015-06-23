## Quiptree

[![Quiptree Logo](https://github.com/kwent/quiptree/blob/master/icons/icon128.png?raw=1)](https://github.com/kwent/quiptree)

Browser extension (Chrome, Opera) to display Quip folders and files in tree format.

* Easy-to-navigate folders and files like IDEs
* Fast browsing
* Support private Quip domains
* Customizable hotkey

## Install on Chrome & Opera

* Download and install Quiptree.
  - [Chrome Web Store](https://chrome.google.com/webstore/detail/quiptree/gcomjeafpffkkijhaigafppjkkadnpkb)
  - [Opera Add-ons Store](https://addons.opera.com/en/extensions/details/quiptree/) (Pending Review)
  - Mozilla Add-ons Store (Not available yet, see below)
  - Safari Add-ons Store (Not available yet, see below)

* Navigate to any Quip document
* The folders and files tree should show on the right-hand side of the screen

## Firefox & Safari

I'm having a hard time to get it works in Firefox and Safari cause [XMLHttpRequest](https://en.wikipedia.org/wiki/XMLHttpRequest) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

**You can build Quiptree for Firefox or Safari and open a pull request if you get it fix and works correctly.**

## Quip access token
Quiptree uses [Quip API](https://quip.com/api/reference) to retrieve repository metadata. All API requests needs to be authenticated by a token.

Quiptree will ask for your Quip personal access token. If you don't already have one, [create one](https://quip.com/api/personal-token), then copy and paste it into the textbox.

Alternatively, you can manually enter or update the token by following these steps:

* Navigate to any Quip repository
* Open the Chrome (or Safari, Firefox) developer console
* Execute the following line:

```javascript
localStorage.setItem('quiptree.quip_access_token', 'REPLACE WITH TOKEN')
```

# Authors

- [Quentin Rousseau](https://github.com/kwent)

# Credits

- [Quiptree](https://github.com/kwent/quiptree) is using Quip Api Javascript wrapper: [quip.js](https://github.com/kwent/quip.js)

- [Quiptree](https://github.com/kwent/quiptree) is largely inspired by [Octotree](https://github.com/buunguyen/octotree) created by [Buu Nguyen](https://github.com/buunguyen).

# Contributing
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
