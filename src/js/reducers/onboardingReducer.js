import * as OnboardingConstants from '../constants/onboardingConstants';

export const initialState = {
  approach: null,
  artifactIncluded: null,
  complete: false,
  deviceType: null,
  demoArtifactPort: 85,
  progress: null,
  showCreateArtifactDialog: false,
  showTips: null,
  showTipsDialog: false
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case OnboardingConstants.SET_DEMO_ARTIFACT_PORT:
      return {
        ...state,
        demoArtifactPort: action.value
      };
    case OnboardingConstants.SET_SHOW_CREATE_ARTIFACT:
      return {
        ...state,
        showCreateArtifactDialog: action.show
      };
    case OnboardingConstants.SET_SHOW_ONBOARDING_HELP:
      return {
        ...state,
        showTips: action.show
      };
    case OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG:
      return {
        ...state,
        showTipsDialog: action.show
      };
    case OnboardingConstants.SET_ONBOARDING_COMPLETE:
      return {
        ...state,
        complete: action.complete
      };
    case OnboardingConstants.SET_ONBOARDING_PROGRESS:
      return {
        ...state,
        progress: action.value
      };
    case OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE:
      return {
        ...state,
        deviceType: action.value
      };
    case OnboardingConstants.SET_ONBOARDING_APPROACH:
      return {
        ...state,
        approach: action.value
      };
    case OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED:
      return {
        ...state,
        artifactIncluded: action.value
      };

    default:
      return state;
  }
};

export default userReducer;
