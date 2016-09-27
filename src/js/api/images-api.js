var request = require('superagent');
var Promise = require('es6-promise').Promise;

var Api = {
  get: function(url) {
    return new Promise(function (resolve, reject) {
      request
        .get(url)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            resolve(res.body);
          }
        });
    });
  },
  xmlPost: function(url, meta, file) {
    // can't use superagent as it doesn't support multipart/mixed
    return new Promise(function (resolve, reject) {
      var xml       =new XMLHttpRequest();
      var multipart ="";

      xml.open("POST", url,true);

      var boundary=Math.random().toString().substr(2);
      xml.setRequestHeader("content-type",
                  "multipart/mixed; boundary=" + boundary);

      multipart += "--" + boundary
                 + "\r\nContent-type: application/json"
                 + "\r\n\r\n" + JSON.stringify(meta) + "\r\n";
      
      multipart += "--" + boundary
                 + "\r\nContent-type: application/octet-stream"
                 + "\r\n\r\n" + file + "\r\n";
      
      multipart += "--"+boundary+"--\r\n";

      xml.onreadystatechange=function(){
        try{
          if(xml.readyState==4){
            resolve(xml.responseText);
          }
        }
        catch(err){
           reject(err.description);
        }
      }
      xml.send(multipart);
    });
  },
  putJSON: function(url, data) {
    return new Promise(function (resolve, reject) {
      request
        .put(url)
        .set('Content-Type', 'application/json')
        .send(data)
        .end(function (err, res) {
          if (err || !res.ok) {
            reject();
          } else {
            var responsetext = "";
            if (res.text) {
              responsetext = JSON.parse(res.text);
            }
            resolve(responsetext);
          }
        });
    });
  }
}

module.exports = Api;