var jwtDecode = require('jwt-decode');

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

