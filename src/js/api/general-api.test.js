import Api from './general-api';
let request = require('superagent');
const superagentMock = require('superagent-mock');

const testLocation = '/test';

const mockApiBase = () => [
  {
    pattern: testLocation,
    fixtures: (match, params, headers, context) => {
      if (match[0] === testLocation) {
        return {
          headers,
          method: context.method
        };
      }
    },
    get: (match, data) => ({
      ...data,
      body: data,
      ok: true
    }),
    delete: (match, data) => ({
      ...data,
      ok: true
    }),
    post: (match, data) => ({
      ...data,
      ok: true
    }),
    put: (match, data) => ({
      ...data,
      ok: true
    })
  }
];

let mockApi;

describe('General API module', () => {
  beforeAll(() => {
    mockApi = superagentMock(request, mockApiBase());
  });

  afterAll(() => {
    mockApi.unset();
  });

  it('should allow GET requests', done => {
    Api.get('/test')
      .then(res => {
        expect(res.headers.Authorization).toMatch(/Bearer/);
        return res.method === 'get' ? done() : done('failed');
      })
      .catch(done);
  });
  it('should allow POST requests', done => {
    Api.post('/test')
      .then(res => {
        expect(res.headers.Authorization).toMatch(/Bearer/);
        return res.method === 'post' ? done() : done('failed');
      })
      .catch(done);
  });
  it('should allow PUT requests', done => {
    Api.put('/test')
      .then(res => {
        expect(res.headers.Authorization).toMatch(/Bearer/);
        return res.method === 'put' ? done() : done('failed');
      })
      .catch(done);
  });
  it('should allow DELETE requests', done => {
    Api.delete('/test')
      .then(res => {
        expect(res.headers.Authorization).toMatch(/Bearer/);
        return res.method === 'del' || res.method === 'delete' ? done() : done('failed');
      })
      .catch(done);
  });
});
