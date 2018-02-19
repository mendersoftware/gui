'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloneChildrenWithClassName = cloneChildrenWithClassName;
exports.isMuiComponent = isMuiComponent;

var _react = require('react');

function cloneChildrenWithClassName(children, className) {
  return _react.Children.map(children, function (child) {
    return (0, _react.isValidElement)(child) && (0, _react.cloneElement)(child, {
      className: child.props.hasOwnProperty('className') ? child.props.className + ' ' + className : className
    });
  });
} //  weak
/* eslint-disable import/prefer-default-export */

function isMuiComponent(element, muiName) {
  return (0, _react.isValidElement)(element) && element.type.muiName === muiName;
}