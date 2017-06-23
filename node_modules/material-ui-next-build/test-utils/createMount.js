'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMount;

var _jss = require('jss');

var _jssPresetDefault = require('jss-preset-default');

var _jssPresetDefault2 = _interopRequireDefault(_jssPresetDefault);

var _jssThemeReactor = require('jss-theme-reactor');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _enzyme = require('enzyme');

var _theme = require('../styles/theme');

var _theme2 = _interopRequireDefault(_theme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  weak

function cleanStyles() {
  var head = window.document.head;
  var length = head.children.length;
  for (var i = length - 1; i >= 0; i -= 1) {
    if (head.children[i].tagName.toLowerCase() === 'style') {
      head.removeChild(head.children[i]);
    }
  }
}

// Generate an enhanced mount function with the needed context.
function createMount() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$mount = options.mount,
      mount = _options$mount === undefined ? _enzyme.mount : _options$mount;

  cleanStyles();

  var attachTo = window.document.createElement('div');
  attachTo.className = 'app';
  attachTo.setAttribute('id', 'app');
  window.document.body.insertBefore(attachTo, window.document.body.firstChild);
  var theme = (0, _theme2.default)();
  var jss = (0, _jss.create)((0, _jssPresetDefault2.default)());
  var styleManager = (0, _jssThemeReactor.createStyleManager)({ jss: jss, theme: theme });
  var context = { styleManager: styleManager };
  var childContextTypes = {
    styleManager: _propTypes2.default.object
  };

  var mountWithContext = function mountWithContext(node) {
    return mount(node, { context: context, attachTo: attachTo, childContextTypes: childContextTypes });
  };

  mountWithContext.context = context;
  mountWithContext.attachTo = attachTo;

  mountWithContext.cleanUp = function () {
    styleManager.reset();
    cleanStyles();
    attachTo.parentNode.removeChild(attachTo);
  };

  return mountWithContext;
}