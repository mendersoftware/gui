// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import * as OnboardingConstants from '../constants/onboardingConstants';
import * as UserConstants from '../constants/userConstants';
import { onboardingSteps } from '../utils/onboardingmanager';
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

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const defaultOnboardingState = {
  approach: null,
  artifactIncluded: null,
  demoArtifactPort: 85,
  deviceType: null,
  showConnectDeviceDialog: false,
  showTips: null,
  something: 'here'
};

export const expectedOnboardingActions = [
  { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: false },
  { type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE, value: ['raspberrypi4'] },
  { type: OnboardingConstants.SET_ONBOARDING_APPROACH, value: 'physical' },
  { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: null },
  { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true },
  { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'application-update-reminder-tip' },
  { type: OnboardingConstants.SET_SHOW_CREATE_ARTIFACT, show: false },
  { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
  {
    type: UserConstants.SET_USER_SETTINGS,
    settings: {
      ...defaultState.users.userSettings,
      onboarding: {
        address: 'http://192.168.10.141:85',
        approach: 'physical',
        artifactIncluded: null,
        complete: false,
        deviceType: ['raspberrypi4'],
        progress: 'application-update-reminder-tip',
        showArtifactCreation: false,
        showTips: true,
        something: 'here'
      }
    }
  }
];

describe('onboarding actions', () => {
  it('should pass on onboarding completion', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setOnboardingComplete(true));
    const expectedActions = [
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false },
      { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'onboarding-finished-notification' },
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: {
          ...defaultState.users.userSettings,
          onboarding: {
            ...defaultOnboardingState,
            complete: true,
            progress: 'onboarding-finished-notification'
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
      { type: OnboardingConstants.SET_ONBOARDING_APPROACH, value: 'test' },
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: { ...defaultState.users.userSettings, onboarding: { approach: 'test', something: 'here' } }
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
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: {
          ...defaultState.users.userSettings,
          columnSelection: [],
          onboarding: { deviceType: 'testtype', something: 'here' }
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
      { type: UserConstants.SET_SHOW_HELP, show: true },
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: {
          ...defaultState.users.userSettings,
          columnSelection: [],
          onboarding: { something: 'here', showTips: true },
          showHelptips: true
        }
      }
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
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: {
          columnSelection: [],
          onboarding: {
            ...defaultOnboardingState,
            complete: false,
            progress: stepNames[1],
            something: 'here'
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
    await store.dispatch(setOnboardingCanceled());
    const expectedActions = [
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false },
      { type: UserConstants.SET_SHOW_HELP, show: false },
      { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show: false },
      { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true },
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: {
          ...defaultState.users.userSettings,
          columnSelection: [],
          onboarding: { showTips: false, something: 'here' },
          showHelptips: false
        }
      },
      { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'onboarding-canceled' },
      { type: UserConstants.SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      {
        type: UserConstants.SET_USER_SETTINGS,
        settings: {
          ...defaultState.users.userSettings,
          columnSelection: [],
          onboarding: {
            ...defaultOnboardingState,
            complete: true,
            progress: 'onboarding-canceled'
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
    const expectedActions = expectedOnboardingActions;
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
});
