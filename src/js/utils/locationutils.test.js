import { DEVICE_STATES, UNGROUPED_GROUP } from '../constants/deviceConstants';
import { commonProcessor, formatDeviceSearch, formatPageState, generateDevicePath, parseDeviceQuery } from './locationutils';

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

