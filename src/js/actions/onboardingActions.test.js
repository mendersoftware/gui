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

describe('setOnboardingComplete', () => {
  it('should pass on onboarding artifact creation dialog', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(setOnboardingComplete(true));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_ONBOARDING_COMPLETE,
        complete: true
      },
      {
        type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP,
        show: false
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});

describe('setOnboardingApproach', () => {
  it('should pass on onboarding artifact creation dialog', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(setOnboardingApproach('test'));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_ONBOARDING_APPROACH,
        value: 'test'
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});

describe('setOnboardingDeviceType', () => {
  it('should pass on onboarding artifact creation dialog', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(setOnboardingDeviceType('testtype'));
    const expectedActions = [
      {
        type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE,
        value: 'testtype'
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});

describe('setShowCreateArtifactDialog', () => {
  it('should pass on onboarding artifact creation dialog', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(setShowCreateArtifactDialog(true));
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
});

describe('setShowDismissOnboardingTipsDialog', () => {
  it('should pass on onboarding tips visibility confirmation', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(setShowDismissOnboardingTipsDialog(true));
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
});

describe('setShowOnboardingHelp', () => {
  it('should pass on onboarding tips visibility', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(setShowOnboardingHelp(true));
    const expectedActions = [{ type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});

describe('advanceOnboarding', () => {
  it('should advance onboarding by one step', () => {
    const store = mockStore({ ...defaultState });
    const stepNames = Object.keys(onboardingSteps);
    store.dispatch(advanceOnboarding(stepNames[0]));
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
});

describe('setOnboardingCanceled', () => {
  it('should disable helptips and store a canceled state', () => {
    const store = mockStore({ ...defaultState });
    const stepNames = Object.keys(onboardingSteps);
    store.dispatch(setOnboardingCanceled(stepNames[0]));
    const expectedActions = [
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show: false },
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});

describe('getOnboardingState', () => {
  it('should try to derive the onboarding state based on the stored state of the environment', () => {
    const store = mockStore({ ...defaultState });
    const stepNames = Object.keys(onboardingSteps);
    store.dispatch(getOnboardingState(stepNames[0]));
    const expectedActions = [
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: false },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true },
      { type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE, value: undefined },
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
              address: 'http://localhost:85',
              approach: 'physical',
              artifactIncluded: undefined,
              complete: false,
              deviceType: undefined,
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
