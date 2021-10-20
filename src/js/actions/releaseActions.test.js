import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState } from '../../../tests/mockData';

import {
  createArtifact,
  editArtifact,
  getArtifactUrl,
  getRelease,
  getReleases,
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
      { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED }
    ];
    await store.dispatch(getReleases());
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
    const expectedActions = [{ type: ReleaseConstants.RELEASE_REMOVED, release: defaultState.releases.byId.r1.Name }];
    await store.dispatch(removeArtifact('art1'));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
