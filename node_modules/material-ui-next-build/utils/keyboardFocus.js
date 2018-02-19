'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.focusKeyPressed = focusKeyPressed;
exports.detectKeyboardFocus = detectKeyboardFocus;
exports.listenForFocusKeys = listenForFocusKeys;

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _contains = require('dom-helpers/query/contains');

var _contains2 = _interopRequireDefault(_contains);

var _addEventListener = require('../utils/addEventListener');

var _addEventListener2 = _interopRequireDefault(_addEventListener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FOCUS_KEYS = ['tab', 'enter', 'space', 'esc', 'up', 'down', 'left', 'right']; //  weak

var internal = {
  listening: false,
  focusKeyPressed: false
};

function isFocusKey(event) {
  return FOCUS_KEYS.indexOf((0, _keycode2.default)(event)) !== -1;
}

function focusKeyPressed(pressed) {
  if (typeof pressed !== 'undefined') {
    internal.focusKeyPressed = Boolean(pressed);
  }

  return internal.focusKeyPressed;
}

function detectKeyboardFocus(instance, element, cb) {
  var attempt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

  instance.keyboardFocusTimeout = setTimeout(function () {
    if (focusKeyPressed() && (document.activeElement === element || (0, _contains2.default)(element, document.activeElement))) {
      cb();
    } else if (attempt < instance.keyboardFocusMaxCheckTimes) {
      detectKeyboardFocus(instance, element, cb, attempt + 1);
    }
  }, instance.keyboardFocusCheckTime);
}

function listenForFocusKeys() {
  if (!internal.listening) {
    (0, _addEventListener2.default)(window, 'keyup', function (event) {
      if (isFocusKey(event)) {
        internal.focusKeyPressed = true;
      }
    });
    internal.listening = true;
  }
}