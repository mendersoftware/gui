import * as OnboardingConstants from '../constants/onboardingConstants';
import reducer, { initialState } from './onboardingReducer';

describe('organization reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle SET_SHOW_CREATE_ARTIFACT', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_SHOW_CREATE_ARTIFACT, show: true }).showCreateArtifactDialog).toEqual(true);
    expect(reducer(initialState, { type: OnboardingConstants.SET_SHOW_CREATE_ARTIFACT, show: false }).showCreateArtifactDialog).toEqual(false);
  });
  it('should handle SET_SHOW_ONBOARDING_HELP', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: true }).showTips).toEqual(true);
    expect(reducer(initialState, { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: false }).showTips).toEqual(false);
  });
  it('should handle SET_SHOW_ONBOARDING_HELP_DIALOG', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show: true }).showTipsDialog).toEqual(true);
    expect(reducer(initialState, { type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show: false }).showTipsDialog).toEqual(false);
  });
  it('should handle SET_ONBOARDING_COMPLETE', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true }).complete).toEqual(true);
    expect(reducer(initialState, { type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: false }).complete).toEqual(false);
  });
  it('should handle SET_ONBOARDING_PROGRESS', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'test' }).progress).toEqual('test');
    expect(reducer(initialState, { type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value: 'test' }).progress).toEqual('test');
  });
  it('should handle SET_ONBOARDING_DEVICE_TYPE', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE, value: 'bbb' }).deviceType).toEqual('bbb');
    expect(reducer(initialState, { type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE, value: 'rpi4' }).deviceType).toEqual('rpi4');
  });
  it('should handle SET_ONBOARDING_APPROACH', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_ONBOARDING_APPROACH, value: 'physical' }).approach).toEqual('physical');
    expect(reducer(initialState, { type: OnboardingConstants.SET_ONBOARDING_APPROACH, value: 'virtual' }).approach).toEqual('virtual');
  });
  it('should handle SET_ONBOARDING_ARTIFACT_INCLUDED', async () => {
    expect(reducer(undefined, { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: true }).artifactIncluded).toEqual(true);
    expect(reducer(initialState, { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: false }).artifactIncluded).toEqual(false);
  });
});
