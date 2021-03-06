import axios from 'axios';

import GeneralApi from '../api/general-api';
import { commonErrorHandler, setSnackbar } from '../actions/appActions';
import ReleaseConstants from '../constants/releaseConstants';
import OnboardingConstants from '../constants/onboardingConstants';

import { customSort, duplicateFilter } from '../helpers';

const apiUrl = '/api/management/v1';
export const deploymentsApiUrl = `${apiUrl}/deployments`;

const flattenRelease = release => {
  release.Artifacts.sort(customSort(1, 'modified'));
  const { descriptions, deviceTypes, latestModified = '' } = release.Artifacts.reduce(
    (accu, item) => {
      item.description ? accu.descriptions.push(item.description) : null;
      accu.deviceTypes.push(...item.device_types_compatible);
      accu.latestModified = accu.latestModified ? accu.latestModified : item.modified;
      return accu;
    },
    { descriptions: [], deviceTypes: [], latestModified: undefined }
  );
  release.descriptions = descriptions;
  release.device_types_compatible = deviceTypes.filter(duplicateFilter);
  release.latestModified = latestModified;
  return release;
};

const findArtifactIndexInRelease = (releases, id) =>
  Object.values(releases).reduce(
    (accu, item) => {
      let index = item.Artifacts.findIndex(releaseArtifact => releaseArtifact.id === id);
      if (index > -1) {
        accu = { release: item, index };
      }
      return accu;
    },
    { release: null, index: -1 }
  );

/* Artifacts */
export const getArtifactUrl = id => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/artifacts/${id}/download`).then(response => {
    const state = getState();
    let { release, index } = findArtifactIndexInRelease(state.releases.byId, id);
    if (!release || index === -1) {
      return dispatch(getReleases());
    }
    release.Artifacts[index].url = response.data.uri;
    return dispatch({ type: ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL, release });
  });

const progress = (e, dispatch) => {
  const uploadProgress = (e.loaded / e.total) * 100;
  return dispatch({
    type: ReleaseConstants.UPLOAD_PROGRESS,
    inprogress: uploadProgress !== 100,
    uploadProgress: uploadProgress < 50 ? Math.ceil(uploadProgress) : Math.round(uploadProgress)
  });
};

let cancelSource;

export const createArtifact = (meta, file) => dispatch => {
  let formData = Object.entries(meta).reduce((accu, [key, value]) => {
    if (Array.isArray(value)) {
      accu.append(key, value.join(','));
    } else if (value instanceof Object) {
      accu.append(key, JSON.stringify(value));
    } else {
      accu.append(key, value);
    }
    return accu;
  }, new FormData());
  formData.append('type', ReleaseConstants.ARTIFACT_GENERATION_TYPE.SINGLE_FILE);
  formData.append('file', file);
  cancelSource = axios.CancelToken.source();
  return Promise.all([
    dispatch(setSnackbar('Generating artifact')),
    dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: true, uploadProgress: 0 }),
    GeneralApi.upload(`${deploymentsApiUrl}/artifacts/generate`, formData, e => progress(e, dispatch), cancelSource.token)
  ])
    .then(() => Promise.all([dispatch(selectRelease(meta.name)), dispatch(setSnackbar('Upload successful', 5000))]))
    .catch(err => {
      if (axios.isCancel(err)) {
        return dispatch(setSnackbar('The artifact generation has been cancelled', 5000));
      }
      return commonErrorHandler(err, `Artifact couldn't be generated.`, dispatch);
    })
    .finally(() => {
      cancelSource = undefined;
      dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 });
    });
};

export const uploadArtifact = (meta, file) => dispatch => {
  var formData = new FormData();
  formData.append('size', file.size);
  formData.append('description', meta.description);
  formData.append('artifact', file);
  cancelSource = axios.CancelToken.source();
  return Promise.all([
    dispatch(setSnackbar('Uploading artifact')),
    dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: true, uploadProgress: 0 }),
    GeneralApi.upload(`${deploymentsApiUrl}/artifacts`, formData, e => progress(e, dispatch), cancelSource.token)
  ])
    .then(() => Promise.resolve(dispatch(setSnackbar('Upload successful', 5000))))
    .catch(err => {
      if (axios.isCancel(err)) {
        return dispatch(setSnackbar('The upload has been cancelled', 5000));
      }
      return commonErrorHandler(err, `Artifact couldn't be uploaded.`, dispatch);
    })
    .finally(() => {
      cancelSource = undefined;
      return dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 });
    });
};

export const cancelArtifactUpload = () => dispatch => {
  cancelSource.cancel();
  cancelSource = undefined;
  return Promise.resolve(dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 }));
};

export const editArtifact = (id, body) => (dispatch, getState) =>
  GeneralApi.put(`${deploymentsApiUrl}/artifacts/${id}`, body)
    .catch(err => commonErrorHandler(err, `Artifact details couldn't be updated.`, dispatch))
    .then(() => {
      const state = getState();
      let { release, index } = findArtifactIndexInRelease(state.releases.byId, id);
      if (!release || index === -1) {
        return dispatch(getReleases());
      }
      release.Artifacts[index].description = body.description;
      return Promise.all([
        dispatch({ type: ReleaseConstants.UPDATED_ARTIFACT, release }),
        dispatch(setSnackbar('Artifact details were updated successfully.', 5000, ''))
      ]);
    });

export const removeArtifact = id => (dispatch, getState) =>
  GeneralApi.delete(`${deploymentsApiUrl}/artifacts/${id}`)
    .then(() => {
      const state = getState();
      let { release, index } = findArtifactIndexInRelease(state.releases.byId, id);
      release.Artifacts.splice(index, 1);
      if (!release.Artifacts.length) {
        return dispatch({ type: ReleaseConstants.RELEASE_REMOVED, release: release.Name });
      }
      return Promise.all([dispatch(setSnackbar('Artifact was removed', 5000, '')), dispatch({ type: ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT, release })]);
    })
    .catch(err => commonErrorHandler(err, `Error removing artifact:`, dispatch));

export const selectArtifact = artifact => (dispatch, getState) => {
  if (!artifact) {
    return dispatch({ type: ReleaseConstants.SELECTED_ARTIFACT, artifact });
  }
  const artifactName = artifact.hasOwnProperty('id') ? artifact.id : artifact;
  const state = getState();
  const release = Object.values(state.releases.byId).find(item => item.Artifacts.find(releaseArtifact => releaseArtifact.id === artifactName));
  if (release) {
    const selectedArtifact = release.Artifacts.find(releaseArtifact => releaseArtifact.id === artifactName);
    let tasks = [dispatch({ type: ReleaseConstants.SELECTED_ARTIFACT, artifact: selectedArtifact })];
    if (release.Name !== state.releases.selectedRelease) {
      tasks.push(dispatch({ type: ReleaseConstants.SELECTED_RELEASE, release: release.Name }));
    }
    return Promise.all(tasks);
  }
};

export const selectRelease = release => dispatch => dispatch({ type: ReleaseConstants.SELECTED_RELEASE, release: release ? release.Name || release : null });

export const showRemoveArtifactDialog = showRemoveDialog => dispatch => dispatch({ type: ReleaseConstants.SHOW_REMOVE_DIALOG, showRemoveDialog });

/* Releases */
export const getReleases = () => dispatch =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/releases`)
    .then(({ data: releases }) => {
      const flatReleases = releases.sort(customSort(1, 'Name')).reduce((accu, release) => {
        accu[release.Name] = flattenRelease(release);
        return accu;
      }, {});
      return Promise.all([
        dispatch({ type: ReleaseConstants.RECEIVE_RELEASES, releases: flatReleases }),
        dispatch({ type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: !!releases.length })
      ]);
    })
    .catch(err => commonErrorHandler(err, `Please check your connection`, dispatch));

export const getRelease = name => dispatch =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/releases?name=${name}`).then(({ data: releases }) =>
    releases.length ? Promise.resolve(dispatch({ type: ReleaseConstants.RECEIVE_RELEASE, release: flattenRelease(releases[0]) })) : Promise.resolve(null)
  );
