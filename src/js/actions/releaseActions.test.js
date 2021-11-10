import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState, releasesList } from '../../../tests/mockData';

import {
  createArtifact,
  editArtifact,
  getArtifactUrl,
  getRelease,
  getReleases,
  refreshReleases,
  removeArtifact,
  selectArtifact,
  selectRelease,
  uploadArtifact
} from './releaseActions';
import AppConstants from '../constants/appConstants';
import OnboardingConstants from '../constants/onboardingConstants';
import ReleaseConstants from '../constants/releaseConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('release actions', () => {
  it('should retrieve a single release by name', async () => {
    const store = mockStore({ ...defaultState });
    store.clearActions();
    const expectedActions = [{ type: ReleaseConstants.RECEIVE_RELEASE, release: defaultState.releases.byId.r1 }];
    await store.dispatch(getRelease(defaultState.releases.byId.r1.Name));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should retrieve a list of releases', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: ReleaseConstants.RECEIVE_RELEASES, releases: defaultState.releases.byId },
      { type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: { ...defaultState.releases.releasesList, releaseIds: ['release-1'], total: 5000 } },
      { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: true },
      { type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: { ...defaultState.releases.releasesList, searchAttribute: 'name' } }
    ];
    await store.dispatch(getReleases({ perPage: 1, sort: { direction: 'asc', attribute: 'Name' } }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should retrieve a search filtered list of releases', async () => {
    const store = mockStore({
      ...defaultState,
      releases: {
        ...defaultState.releases,
        releasesList: { ...defaultState.releases.releasesList, searchAttribute: 'name' }
      }
    });
    const expectedActions = [
      { type: ReleaseConstants.RECEIVE_RELEASES, releases: defaultState.releases.byId },
      { type: ReleaseConstants.RECEIVE_RELEASES, releases: defaultState.releases.byId },
      {
        type: ReleaseConstants.SET_RELEASES_LIST_STATE,
        value: {
          ...defaultState.releases.releasesList,
          releaseIds: [
            defaultState.releases.byId.r1.Name,
            ...Array.from({ length: 9 }),
            'release-99',
            'release-989',
            'release-988',
            'release-987',
            'release-986',
            'release-985',
            'release-984',
            'release-983',
            'release-982',
            'release-981',
            'release-980',
            'release-98',
            'release-979',
            'release-978',
            'release-977',
            'release-976',
            'release-975',
            'release-974',
            'release-973',
            'release-972'
          ]
        }
      }
    ];
    await store.dispatch(getReleases({ searchTerm: 'something', visibleSection: { start: 24, end: 28 } }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should retrieve a deployment creation search filtered list of releases', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: ReleaseConstants.RECEIVE_RELEASES, releases: defaultState.releases.byId },
      {
        type: ReleaseConstants.SET_RELEASES_LIST_STATE,
        value: {
          ...defaultState.releases.releasesList,
          searchedIds: [
            'release-1',
            'release-10',
            'release-100',
            'release-1000',
            'release-1001',
            'release-1002',
            'release-1003',
            'release-1004',
            'release-1005',
            'release-1006'
          ]
        }
      },
      { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: true },
      { type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: { ...defaultState.releases.releasesList, searchAttribute: 'name' } }
    ];
    await store.dispatch(getReleases({ perPage: 10, searchOnly: true, searchTerm: 'something' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should refresh a list of releases', async () => {
    const sectionLength = 78;
    const expectedPageSize = 100;
    const start = 321;
    const startIndex = Math.floor(start / expectedPageSize) * expectedPageSize;
    const expectedWindowLength = Math.ceil(sectionLength / expectedPageSize) * expectedPageSize;
    const releaseIds = [
      defaultState.releases.byId.r1.Name,
      ...Array.from({ length: startIndex - 1 }),
      ...releasesList.slice(startIndex, startIndex + expectedWindowLength).map(item => item.Name)
    ];
    const expectedActions = [
      { type: ReleaseConstants.RECEIVE_RELEASES, releases: defaultState.releases.byId },
      {
        type: ReleaseConstants.SET_RELEASES_LIST_STATE,
        value: {
          ...defaultState.releases.releasesList,
          page: 20,
          releaseIds
        }
      }
    ];
    const store = mockStore({
      ...defaultState,
      releases: { ...defaultState.releases, releasesList: { ...defaultState.releases.releasesList, visibleSection: { start: 4, end: 8 } } }
    });
    await store.dispatch(
      refreshReleases({ visibleSection: { start: startIndex, end: startIndex + sectionLength }, sort: { attribute: 'modified', direction: 'asc' } })
    );
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should retrieve the download url for an artifact', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL,
        release: {
          ...defaultState.releases.byId.r1,
          Artifacts: [
            {
              ...defaultState.releases.byId.r1.Artifacts[0],
              url: 'https://testlocation.com/artifact.mender'
            }
          ]
        }
      }
    ];
    await store.dispatch(getArtifactUrl('art1')).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should select an artifact by name', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: ReleaseConstants.SELECTED_ARTIFACT, artifact: defaultState.releases.byId.r1.Artifacts[0] },
      { type: ReleaseConstants.SELECTED_RELEASE, release: defaultState.releases.byId.r1.Name }
    ];
    await store.dispatch(selectArtifact('art1'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should select a release by name', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(selectRelease('test'));
    const expectedActions = [{ type: ReleaseConstants.SELECTED_RELEASE, release: 'test' }];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should allow creating an artifact', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Generating artifact' } },
      { type: AppConstants.UPLOAD_PROGRESS, inprogress: true, uploadProgress: 0 },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Upload successful' } },
      { type: AppConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 }
    ];
    await store.dispatch(createArtifact({ name: 'createdRelease', some: 'thing', someList: ['test', 'more'], complex: { objectThing: 'yes' } }, 'filethings'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should support editing artifact information', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: ReleaseConstants.UPDATED_ARTIFACT,
        release: {
          ...defaultState.releases.byId.r1,
          Artifacts: [{ ...defaultState.releases.byId.r1.Artifacts[0], description: 'something new' }]
        }
      },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Artifact details were updated successfully.' } }
    ];
    await store.dispatch(editArtifact(defaultState.releases.byId.r1.Artifacts[0].id, { description: 'something new' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should support uploading .mender artifact files', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Uploading artifact' } },
      { type: AppConstants.UPLOAD_PROGRESS, inprogress: true, uploadProgress: 0 },
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'Upload successful' } },
      { type: AppConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 }
    ];
    await store.dispatch(uploadArtifact({ description: 'new artifact to upload' }, { size: 1234 }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should remove an artifact by name', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: ReleaseConstants.RELEASE_REMOVED, release: defaultState.releases.byId.r1.Name },
      { type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: { ...defaultState.releases.releasesList, releaseIds: [], total: 0 } }
    ];
    await store.dispatch(removeArtifact('art1'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
