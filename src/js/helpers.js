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


export function decodeSessionToken(token) {
  
  try {
    var decoded = jwtDecode(token);
    return decoded.sub;
  }
  catch (err) {
    console.log(err);
    return;
  }
 
}