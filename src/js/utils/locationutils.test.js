import { DEVICE_STATES, UNGROUPED_GROUP } from '../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../constants/organizationConstants';
import {
  commonProcessor,
  formatAuditlogs,
  formatDeviceSearch,
  formatPageState,
  generateDevicePath,
  parseAuditlogsQuery,
  parseDeviceQuery
} from './locationutils';

const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
const tonight = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

describe('locationutils', () => {
  describe('common', () => {
    it('uses working utilties - commonProcessor', () => {
      const startParams = new URLSearchParams('?perPage=234&id=123-324&open=true&sort=asc&issues=issueType1&issues=issueType2');
      const { pageState, params, sort } = commonProcessor(startParams);
      expect(sort).toEqual({ direction: 'asc' });
      expect(pageState).toEqual({ id: '123-324', issues: ['issueType1', 'issueType2'], open: true, perPage: 234 });
      expect(params.has('page')).not.toBeTruthy();
    });
    it('uses working utilities - formatPageState', () => {
      const search = formatPageState(
        { selectedId: 123, selectedIssues: ['1243', 'qweioqwei'], page: 1234, perPage: 1000, sort: { direction: 'desc', key: 'someKey' } },
        { defaults: { sort: { direction: 'asc' } } }
      );
      expect(search).toEqual('sort=someKey:desc&page=1234&perPage=1000&id=123&issues=1243&issues=qweioqwei&open=true');
    });
  });
  describe('auditlog', () => {
    it('uses working utilties - formatAuditlogs', () => {
      const search = formatAuditlogs(
        {
          pageState: {
            detail: 'testgroup',
            endDate: new Date().toISOString(),
            startDate: new Date('2000-01-01').toISOString(),
            type: AUDIT_LOGS_TYPES[0],
            user: { id: 1 }
          }
        },
        { today, tonight }
      );
      expect(search).toEqual('objectId=testgroup&userId=1&objectType=deployment&endDate=2019-01-01&startDate=2000-01-01');
    });
    it('uses working utilities - parseAuditlogsQuery', () => {
      const result = parseAuditlogsQuery(new URLSearchParams('objectId=testgroup&userId=1&objectType=device&endDate=2019-01-01&startDate=2000-01-01'), {
        today,
        tonight
      });
      const endDate = new Date('2019-01-01');
      endDate.setHours(23, 59, 59, 999);
      expect(result).toEqual({
        detail: 'testgroup',
        endDate: endDate.toISOString(),
        startDate: new Date('2000-01-01').toISOString(),
        type: AUDIT_LOGS_TYPES[1],
        user: '1'
      });
    });
  });
  describe('devices', () => {
    it('uses working utilties - parseDeviceQuery converts classic url style', () => {
      const { groupName, filters } = parseDeviceQuery(new URLSearchParams('?some=thing&group=testgroup&mac=donalds&existing=filter'), {
        filteringAttributes: { identityAttributes: ['mac'], inventoryAttributes: ['some'] }
      });
      expect(groupName).toEqual('testgroup');
      expect(filters).toEqual([
        { key: 'mac', operator: '$eq', scope: 'identity', value: 'donalds' },
        { key: 'some', operator: '$eq', scope: 'inventory', value: 'thing' },
        { key: 'existing', operator: '$eq', scope: 'inventory', value: 'filter' }
        // { key: 'existing', operator: '$wat', scope: 'special', value: 'filter' }
      ]);
    });
    it('uses working utilties - parseDeviceQuery converts new style', () => {
      const { groupName, filters } = parseDeviceQuery(new URLSearchParams('?inventory=some:eq:thing&inventory=group:eq:testgroup&identity=bla:neq:blubb'));
      expect(groupName).toEqual('testgroup');
      expect(filters).toEqual([
        { key: 'bla', operator: '$neq', scope: 'identity', value: 'blubb' },
        { key: 'some', operator: '$eq', scope: 'inventory', value: 'thing' }
      ]);
    });

    const devicesPath = '/devices/asd';
    const devicesSearch = '?some=thing&different=thing&entirely=different';
    it('uses working utilties - formatDeviceSearch', () => {
      const pageState = {
        pageState: { state: DEVICE_STATES.pending },
        filters: [{ key: 'some', value: 'thing' }],
        selectedGroup: 'testgroup',
        location: { pathname: devicesPath, search: devicesSearch }
      };
      const pathname = generateDevicePath(pageState);
      const search = formatDeviceSearch(pageState);
      expect(pathname).toEqual('/devices/pending');
      expect(search).toEqual('inventory=some:eq:thing&inventory=group:eq:testgroup');
    });

    it('uses working utilties - formatDeviceSearch - on init', () => {
      const pageState = {
        pageState: { state: DEVICE_STATES.accepted },
        filters: [{ key: 'some', value: 'thing' }],
        selectedGroup: 'testgroup',
        location: { pathname: devicesPath, search: devicesSearch }
      };
      const pathname = generateDevicePath(pageState);
      const search = formatDeviceSearch(pageState);
      expect(pathname).toEqual('/devices/accepted');
      expect(search).toEqual('inventory=some:eq:thing&inventory=group:eq:testgroup');
    });

    it('uses working utilties - formatDeviceSearch - with ungrouped selected', () => {
      const search = formatDeviceSearch({
        filters: [{ key: 'some', value: 'thing' }],
        selectedGroup: UNGROUPED_GROUP.id
      });
      expect(search).toEqual('inventory=some:eq:thing&inventory=group:eq:Unassigned');
    });
  });
});
