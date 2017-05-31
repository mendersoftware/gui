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