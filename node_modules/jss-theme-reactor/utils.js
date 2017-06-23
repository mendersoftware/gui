'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.transform = transform;
exports.find = find;
exports.findIndex = findIndex;
exports.contains = contains;

/* eslint-disable no-bitwise, no-plusplus */

function transform(obj, iteratee, accumulator) {
  Object.keys(obj).forEach(function (key) {
    iteratee(accumulator, obj[key], key);
  });
  return accumulator;
}

function find(arr, pred) {
  var index = findIndex(arr, pred);
  return index > -1 ? arr[index] : undefined;
}

function findIndex(arr, pred) {
  var predType = typeof pred === 'undefined' ? 'undefined' : _typeof(pred);
  for (var i = 0; i < arr.length; i++) {
    if (predType === 'function' && pred(arr[i], i, arr) === true) {
      return i;
    }
    if (predType === 'object' && contains(arr[i], pred)) {
      return i;
    }
    if (['string', 'number', 'boolean'].indexOf(predType) !== -1) {
      return arr.indexOf(pred);
    }
  }
  return -1;
}

function contains(obj, pred) {
  for (var _key in pred) {
    if (!obj.hasOwnProperty(_key) || obj[_key] !== pred[_key]) {
      return false;
    }
  }
  return true;
}