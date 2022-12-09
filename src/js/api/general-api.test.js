import MockAdapter from 'axios-mock-adapter';

import Api, { authenticatedRequest } from './general-api';

const testLocation = '/test';

let mockApi;

describe('General API module', () => {
  beforeAll(() => {
    mockApi = new MockAdapter(authenticatedRequest);
    mockApi.onGet(testLocation).reply(200).onPost(testLocation).reply(200, {}).onPut(testLocation).reply(200, {}).onDelete(testLocation).reply(200, {});
  });

  afterAll(() => {
    mockApi.restore();
  });

  it('should allow GET requests', done => {
    Api.get(testLocation)
      .then(res => {
        expect(res.config.headers.Authorization).toMatch(/Bearer/);
        return res.config.method === 'get' ? done() : done('failed');
      })
      .catch(done);
  });
  it('should allow POST requests', done => {
    Api.post(testLocation)
      .then(res => {
        expect(res.config.headers.Authorization).toMatch(/Bearer/);
        return res.config.method === 'post' ? done() : done('failed');
      })
      .catch(done);
  });
  it('should allow PUT requests', done => {
    Api.put(testLocation)
      .then(res => {
        expect(res.config.headers.Authorization).toMatch(/Bearer/);
        return res.config.method === 'put' ? done() : done('failed');
      })
      .catch(done);
  });
  it('should allow DELETE requests', done => {
    Api.delete(testLocation)
      .then(res => {
        expect(res.config.headers.Authorization).toMatch(/Bearer/);
        return res.config.method === 'del' || res.config.method === 'delete' ? done() : done('failed');
      })
      .catch(done);
  });
});
