'use strict';

import { POP } from './Actions';
import parsePath from './parsePath';

function createLocation() {
  var location = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
  var state = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
  var action = arguments.length <= 2 || arguments[2] === undefined ? POP : arguments[2];
  var key = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  if (typeof location === 'string') location = parsePath(location);

  var pathname = location.pathname || '/';
  var search = location.search || '';
  var hash = location.hash || '';

  // TODO: Deprecate passing state directly into createLocation.
  state = location.state || state;

  return {
    pathname: pathname,
    search: search,
    hash: hash,
    state: state,
    action: action,
    key: key
  };
}

export default createLocation;