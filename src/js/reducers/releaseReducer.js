import * as ReleaseConstants from '../constants/releaseConstants';

const initialState = {
  byId: {},
  selectedRelease: null,
  selectedArtifact: null,
  uploading: false
};

/*
 * Return list of saved artifacts objects
 */
// getArtifactsRepo: () => discoverDevices(_artifactsRepo),

// /*
//  * return list of artifacts where duplicate names are collated with device compatibility lists combined
//  */
// getCollatedArtifacts: () => _collateArtifacts(),

// /*
//  * Return single artifact by attr
//  */
// getSoftwareArtifact: (attr, val) => _artifactsRepo.find(item => item[attr] === val),

// /*
//  * Return list of saved release objects
//  */
// getReleases: () => _releasesRepo,

// /*
//  * Return single release with corresponding Artifacts
//  */
// getRelease: name => _releasesRepo.find(item => item.Name === name),

// getUploadInProgress: () => _uploadInProgress,

const releaseReducer = (state = initialState, action) => {
  switch (action.type) {
  case ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT:
    return state;
  case ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL:
    return state;
  case ReleaseConstants.UPLOAD_ARTIFACT:
    return state;
  case ReleaseConstants.UPDATED_ARTIFACT:
    return state;
  case ReleaseConstants.UPLOAD_PROGRESS:
    return state;
  case ReleaseConstants.RECEIVE_ARTIFACTS:
    return state;
  case ReleaseConstants.RECEIVE_RELEASES:
    return state;
  default:
    return state;
  }
};

export default releaseReducer;
