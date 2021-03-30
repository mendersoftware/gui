import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState } from '../../../tests/mockData';

import {
  advanceOnboarding,
  getOnboardingState,
  setOnboardingApproach,
  setOnboardingCanceled,
  setOnboardingComplete,
  setOnboardingDeviceType,
  setShowCreateArtifactDialog,
  setShowDismissOnboardingTipsDialog,
  setShowOnboardingHelp
} from './onboardingActions';
import { onboardingSteps } from '../utils/onboardingmanager';
import OnboardingConstants from '../constants/onboardingConstants';
import UserConstants from '../constants/userConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('onboarding actions', () => {
  it('should pass on onboarding completion', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setOnboardingComplete(true));
    const expectedActions = [
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false },
      { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'onboarding-finished-notification' },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            onboarding: {
              complete: true,
              demoArtifactPort: 85,
              progress: 'onboarding-finished-notification',
              showConnectDeviceDialog: false
            }
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should pass on onboarding approach', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setOnboardingApproach('test'));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_ONBOARDING_APPROACH,
        value: 'test'
      },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            onboarding: { approach: 'test' }
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should pass on onboarding device type', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setOnboardingDeviceType('testtype'));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE,
        value: 'testtype'
      },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            onboarding: { deviceType: 'testtype' }
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should pass on onboarding artifact creation dialog', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setShowCreateArtifactDialog(true));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_SHOW_CREATE_ARTIFACT,
        show: true
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should pass on onboarding tips visibility confirmation', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setShowDismissOnboardingTipsDialog(true));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG,
        show: true
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should pass on onboarding tips visibility', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setShowOnboardingHelp(true));
    const expectedActions = [
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            onboarding: { showTips: true }
          }
        }
      },
      { type: UserConstants.SET_SHOW_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should advance onboarding by one step', async () => {
    const store = mockStore({ ...defaultState });
    const stepNames = Object.keys(onboardingSteps);
    await store.dispatch(advanceOnboarding(stepNames[0]));
    const expectedActions = [
      { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: stepNames[1] },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.byId.a1.id]: {
            onboarding: {
              complete: false,
              demoArtifactPort: 85,
              progress: stepNames[1],
              showConnectDeviceDialog: false
            }
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should disable helptips and store a canceled state', async () => {
    const store = mockStore({ ...defaultState });
    const stepNames = Object.keys(onboardingSteps);
    await store.dispatch(setOnboardingCanceled(stepNames[0]));
    const expectedActions = [
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            onboarding: { showTips: false }
          }
        }
      },
      { type: UserConstants.SET_SHOW_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show: false },
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true },
      { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'onboarding-canceled' },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            onboarding: { complete: true, demoArtifactPort: 85, progress: 'onboarding-canceled', showConnectDeviceDialog: false }
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should try to derive the onboarding state based on the stored state of the environment', async () => {
    const store = mockStore({ ...defaultState });
    const stepNames = Object.keys(onboardingSteps);
    await store.dispatch(getOnboardingState(stepNames[0]));
    const expectedActions = [
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: false },
      { type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE, value: 'raspberrypi4' },
      { type: OnboardingConstants.SET_ONBOARDING_APPROACH, value: 'physical' },
      { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: undefined },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true },
      { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'application-update-reminder-tip' },
      { type: OnboardingConstants.SET_SHOW_CREATE_ARTIFACT, show: false },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.byId.a1.id]: {
            onboarding: {
              address: 'http://192.168.10.141:85',
              approach: 'physical',
              artifactIncluded: undefined,
              complete: false,
              deviceType: 'raspberrypi4',
              progress: 'application-update-reminder-tip',
              showArtifactCreation: false,
              showTips: true
            }
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});
