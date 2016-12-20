/**
 * index.js
 *
 */
module.exports = function(superagent) {
  var Request = superagent.Request;
  if (Request) {
    Request.prototype.authBearer = function(token) {
      return this.set('Authorization', 'Bearer ' + token);
    };
  }
  return superagent;
};
