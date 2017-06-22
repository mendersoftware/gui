'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _style = require('dom-helpers/style');

var _style2 = _interopRequireDefault(_style);

var _isWindow = require('dom-helpers/query/isWindow');

var _isWindow2 = _interopRequireDefault(_isWindow);

var _ownerDocument = require('dom-helpers/ownerDocument');

var _ownerDocument2 = _interopRequireDefault(_ownerDocument);

var _inDOM = require('dom-helpers/util/inDOM');

var _inDOM2 = _interopRequireDefault(_inDOM);

var _scrollbarSize = require('dom-helpers/util/scrollbarSize');

var _scrollbarSize2 = _interopRequireDefault(_scrollbarSize);

var _manageAriaHidden = require('../utils/manageAriaHidden');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Do we have a scroll bar?
 * @private
 */
//  weak

function bodyIsOverflowing(node) {
  var doc = (0, _ownerDocument2.default)(node);
  var win = (0, _isWindow2.default)(doc);
  return doc.body.clientWidth < win.innerWidth;
}

// The container shouldn't be used on the server.
var defaultContainer = _inDOM2.default ? window.document.body : {};

/**
 * State management helper for modals/layers.
 * Simplified, but inspired by react-overlay's ModalManager class
 *
 * @internal Used by the Modal to ensure proper focus management.
 */
function createModalManager() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$container = _ref.container,
      container = _ref$container === undefined ? defaultContainer : _ref$container,
      _ref$hideSiblingNodes = _ref.hideSiblingNodes,
      hideSiblingNodes = _ref$hideSiblingNodes === undefined ? true : _ref$hideSiblingNodes;

  var modals = [];

  var prevOverflow = void 0;
  var prevPadding = void 0;

  function add(modal) {
    var modalIdx = modals.indexOf(modal);

    if (modalIdx !== -1) {
      return modalIdx;
    }

    modalIdx = modals.length;
    modals.push(modal);

    if (hideSiblingNodes) {
      (0, _manageAriaHidden.hideSiblings)(container, modal.mountNode);
    }

    if (modals.length === 1) {
      var containerStyle = {
        overflow: 'hidden',
        paddingRight: undefined
      };

      // Save our current overflow so we can revert
      // back to it when all modals are closed!
      prevOverflow = container.style.overflow;

      if (bodyIsOverflowing(container)) {
        prevPadding = container.style.paddingRight;
        containerStyle.paddingRight = parseInt(prevPadding || 0, 10) + (0, _scrollbarSize2.default)() + 'px';
      }

      (0, _style2.default)(container, containerStyle);
    }

    return modalIdx;
  }

  function remove(modal) {
    var modalIdx = modals.indexOf(modal);

    if (modalIdx === -1) {
      return modalIdx;
    }

    modals.splice(modalIdx, 1);

    if (modals.length === 0) {
      container.style.overflow = prevOverflow;
      container.style.paddingRight = prevPadding;
      prevOverflow = undefined;
      prevPadding = undefined;
      if (hideSiblingNodes) {
        (0, _manageAriaHidden.showSiblings)(container, modal.mountNode);
      }
    } else if (hideSiblingNodes) {
      // otherwise make sure the next top modal is visible to a SR
      (0, _manageAriaHidden.ariaHidden)(false, modals[modals.length - 1].mountNode);
    }

    return modalIdx;
  }

  function isTopModal(modal) {
    return !!modals.length && modals[modals.length - 1] === modal;
  }

  var modalManager = { add: add, remove: remove, isTopModal: isTopModal };

  return modalManager;
}

exports.default = createModalManager;