// Copyright 2019 Northern.tech AS
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
import { SORTING_OPTIONS } from '../constants/appConstants';
import * as DeviceConstants from '../constants/deviceConstants';
import * as ReleaseConstants from '../constants/releaseConstants';

export const initialState = {
  /*
   * Return list of saved artifacts objects
   */
  /*
   * return list of artifacts where duplicate names are collated with device compatibility lists combined
   */
  // artifacts: AppStore.getCollatedArtifacts(AppStore.getArtifactsRepo()),
  artifacts: [],
  /*
   * Return list of saved release objects
   */
  byId: {
    /*
    [releaseName]: {
      Artifacts: [
        {
          id: '',
          name: '',
          description: '',
          device_types_compatible: [],
          ...
          updates: [{
            files: [
              { size: 123, name: '' }
            ],
            type_info: { type: '' }
          }],
          url: '' // optional
        }
      ],
      modified: ''
      device_types_compatible,
      Name: ''
    }
    */
  },
  releasesList: {
    ...DeviceConstants.DEVICE_LIST_DEFAULTS,
    searchedIds: [],
    releaseIds: [],
    sort: {
      direction: SORTING_OPTIONS.desc,
      key: 'modified'
    },
    isLoading: undefined,
    searchTerm: '',
    searchTotal: 0,
    total: 0
  },
  releaseTags: [],
  /*
   * Return single release with corresponding Artifacts
   */
  selectedRelease: null,
  selectedArtifact: null,
  showRemoveDialog: false
};

const releaseReducer = (state = initialState, action) => {
  switch (action.type) {
    case ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT:
    case ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL:
    case ReleaseConstants.UPDATED_ARTIFACT:
    case ReleaseConstants.RECEIVE_RELEASE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.release.Name]: action.release
        }
      };
    case ReleaseConstants.RECEIVE_RELEASES: {
      return {
        ...state,
        byId: action.releases
      };
    }
    case ReleaseConstants.RELEASE_REMOVED: {
      // eslint-disable-next-line no-unused-vars
      const { [action.release]: toBeRemoved, ...byId } = state.byId;
      return {
        ...state,
        byId,
        selectedRelease: action.release === state.selectedRelease ? Object.keys(byId)[0] : state.selectedRelease
      };
    }
    case ReleaseConstants.SELECTED_ARTIFACT:
      return {
        ...state,
        selectedArtifact: action.artifact
      };
    case ReleaseConstants.SHOW_REMOVE_DIALOG:
      return {
        ...state,
        showRemoveDialog: action.showRemoveDialog
      };
    case ReleaseConstants.SELECTED_RELEASE:
      return {
        ...state,
        selectedRelease: action.release
      };
    case ReleaseConstants.SET_RELEASES_LIST_STATE:
      return { ...state, releasesList: action.value };
    default:
      return state;
  }
};

export default releaseReducer;
