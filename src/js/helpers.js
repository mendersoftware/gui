var jwtDecode = require('jwt-decode');
var md5 = require('md5');

export function isEncoded(uri) {
  uri = uri || '';

  return uri !== decodeURIComponent(uri);
}

export function fullyDecodeURI(uri){

  while (isEncoded(uri)){
    uri = decodeURIComponent(uri);
  }

  return uri;
}

export function statusToPercentage(state) {
  switch(state) {
    case "pending":
      return 10;

    case "downloading":
      return 10;

    case "installing":
      return 70;

    case "rebooting":
      return 80;

    case "aborted":
    case "already-installed":
    case "failure":
    case "noartifact":
    case "success":
      return 100;
  }
}

export function decodeSessionToken(token) {

  try {
    var decoded = jwtDecode(token);
    return decoded.sub;
  }
  catch (err) {
    //console.log(err);
    return;
  }
}

export function isEmpty( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  return true;
}

export function preformatWithRequestID(res, failMsg) {
  // ellipsis line
  if (failMsg.length > 100)
      failMsg = failMsg.substring(0, 100)+'...';

  try {
    if (res.body && Object.keys(res.body).includes("request_id")) {
        let failRequestUUID = res.body["request_id"]
        let shortRequestUUID = res.body["request_id"].substring(0, 8)
        let finalMessage = `${failMsg} [Request ID: ${shortRequestUUID}]`
        return finalMessage
    }
  } catch (e) {
    console.log("failed to extract request id:", e)
  }
  return failMsg
}


/*
* compare version strings like 1.2.1, 1.2.0 etc
* from https://gist.github.com/TheDistantSea/8021359
*/
export function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}



export function hashString(str) {
  return md5(str);
}