import Cookies from 'universal-cookie';
const cookies = new Cookies();
const request = require('superagent');

const Api = {
  postLogin: (url, userData) => {
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return new Promise((resolve, reject) =>
      request
        .post(url)
        .auth(userData.email, userData.password)
        .set('Content-Type', 'application/json')
        .send(body)
        .end((err, res) => {
          if (err || !res.ok) {
            var errorResponse = {
              text: err.response ? JSON.parse(err.response.text) : err,
              code: err.status
            };
            reject({ error: errorResponse, res: res });
          } else {
            var response = {
              text: res.text,
              code: res.status
            };
            resolve(response);
          }
        })
    );
  },
  putVerifyTFA: (url, userData) => {
    var token = cookies.get('JWT');
    let body = {};
    if (userData.hasOwnProperty('token2fa')) {
      body = { token2fa: userData.token2fa };
    }
    return new Promise((resolve, reject) =>
      request
        .put(url)
        .auth(token, { type: 'bearer' })
        .set('Content-Type', 'application/json')
        .send(body)
        .end((err, res) => {
          if (err || !res.ok) {
            var errorResponse = {
              text: err.response ? JSON.parse(err.response.text) : err,
              code: err.status
            };
            reject({ error: errorResponse, res: res });
          } else {
            var response = {
              text: res.text,
              code: res.status
            };
            resolve(response);
          }
        })
    );
  }
};

export default Api;
