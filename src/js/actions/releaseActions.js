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
import { isCancel } from 'axios';
import { v4 as uuid } from 'uuid';

import { commonErrorFallback, commonErrorHandler, setSnackbar } from '../actions/appActions';
import GeneralApi, { headerNames } from '../api/general-api';
import { SORTING_OPTIONS, TIMEOUTS, UPLOAD_PROGRESS } from '../constants/appConstants';
import { DEVICE_LIST_DEFAULTS, emptyFilter } from '../constants/deviceConstants';
import { SET_ONBOARDING_ARTIFACT_INCLUDED } from '../constants/onboardingConstants';
import * as ReleaseConstants from '../constants/releaseConstants';
import { customSort, deepCompare, duplicateFilter, extractSoftwareItem } from '../helpers';
import { deploymentsApiUrl } from './deploymentActions';
import { convertDeviceListStateToFilters, getSearchEndpoint } from './deviceActions';

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const flattenRelease = (release, stateRelease) => {
  const updatedArtifacts = release.Artifacts.sort(customSort(1, 'modified'));
  const { Artifacts, deviceTypes, modified } = updatedArtifacts.reduce(
    (accu, item) => {
      accu.deviceTypes.push(...item.device_types_compatible);
      const stateArtifact = stateRelease.Artifacts?.find(releaseArtifact => releaseArtifact.id === item.id) || {};
      accu.modified = accu.modified ? accu.modified : item.modified;
      accu.Artifacts.push({
        ...stateArtifact,
        ...item
      });
      return accu;
    },
    { Artifacts: [], deviceTypes: [], modified: undefined }
  );
  return { ...stateRelease, ...release, Artifacts, device_types_compatible: deviceTypes.filter(duplicateFilter), modified };
};

const reduceReceivedReleases = (releases, stateReleasesById) =>
  releases.reduce((accu, release) => {
    const stateRelease = stateReleasesById[release.Name] || {};
    accu[release.Name] = flattenRelease(release, stateRelease);
    return accu;
  }, {});

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
export const getArtifactInstallCount = id => (dispatch, getState) => {
  let { release, index } = findArtifactIndexInRelease(getState().releases.byId, id);
  if (!release || index === -1) {
    return;
  }
  const releaseArtifacts = [...release.Artifacts];
  const artifact = releaseArtifacts[index];
  const { key, name, version } = extractSoftwareItem(artifact.artifact_provides) ?? {};
  const attribute = `${key}${name ? `.${name}` : ''}.version`;
  const { filterTerms } = convertDeviceListStateToFilters({
    filters: [{ ...emptyFilter, key: attribute, value: version, scope: 'inventory' }]
  });
  return GeneralApi.post(getSearchEndpoint(getState().app.features.hasReporting), {
    page: 1,
    per_page: 1,
    filters: filterTerms,
    attributes: [{ scope: 'identity', attribute: 'status' }]
  })
    .catch(err => commonErrorHandler(err, `Retrieving artifact installation count failed:`, dispatch, commonErrorFallback))
    .then(({ headers }) => {
      let { release, index } = findArtifactIndexInRelease(getState().releases.byId, id);
      if (!release || index === -1) {
        return;
      }
      const installCount = Number(headers[headerNames.total]);
      const releaseArtifacts = [...release.Artifacts];
      releaseArtifacts[index] = { ...releaseArtifacts[index], installCount };
      release = {
        ...release,
        Artifacts: releaseArtifacts
      };
      return dispatch({ type: ReleaseConstants.RECEIVE_RELEASE, release });
    });
};

export const getArtifactUrl = id => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/artifacts/${id}/download`).then(response => {
    const state = getState();
    let { release, index } = findArtifactIndexInRelease(state.releases.byId, id);
    if (!release || index === -1) {
      return dispatch(getReleases());
    }
    const releaseArtifacts = [...release.Artifacts];
    releaseArtifacts[index] = {
      ...releaseArtifacts[index],
      url: response.data.uri
    };
    release = {
      ...release,
      Artifacts: releaseArtifacts
    };
    return dispatch({ type: ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL, release });
  });

export const cleanUpUpload = uploadId => (dispatch, getState) => {
  // eslint-disable-next-line no-unused-vars
  const { [uploadId]: current, ...remainder } = getState().app.uploadsById;
  return Promise.resolve(dispatch({ type: UPLOAD_PROGRESS, uploads: remainder }));
};

export const createArtifact = (meta, file) => (dispatch, getState) => {
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
  const uploadId = uuid();
  const cancelSource = new AbortController();
  const uploads = { ...getState().app.uploadsById, [uploadId]: { name: file.name, size: file.size, uploadProgress: 0, cancelSource } };
  return Promise.all([
    dispatch(setSnackbar('Generating artifact')),
    dispatch({ type: UPLOAD_PROGRESS, uploads }),
    GeneralApi.upload(`${deploymentsApiUrl}/artifacts/generate`, formData, e => dispatch(progress(e, uploadId)), cancelSource.signal)
  ])
    .then(() => {
      setTimeout(() => dispatch(selectRelease(meta.name)), TIMEOUTS.oneSecond);
      return Promise.resolve([dispatch(setSnackbar('Upload successful', 5000))]);
    })
    .catch(err => {
      if (isCancel(err)) {
        return dispatch(setSnackbar('The artifact generation has been cancelled', 5000));
      }
      return commonErrorHandler(err, `Artifact couldn't be generated.`, dispatch);
    })
    .finally(() => dispatch(cleanUpUpload(uploadId)));
};

export const uploadArtifact = (meta, file) => (dispatch, getState) => {
  let formData = new FormData();
  formData.append('size', file.size);
  formData.append('description', meta.description);
  formData.append('artifact', file);
  const uploadId = uuid();
  const cancelSource = new AbortController();
  const uploads = { ...getState().app.uploadsById, [uploadId]: { name: file.name, size: file.size, uploadProgress: 0, cancelSource } };
  return Promise.all([
    dispatch(setSnackbar('Uploading artifact')),
    dispatch({ type: UPLOAD_PROGRESS, uploads }),
    GeneralApi.upload(`${deploymentsApiUrl}/artifacts`, formData, e => dispatch(progress(e, uploadId)), cancelSource.signal)
  ])
    .then(() => {
      const tasks = [dispatch(setSnackbar('Upload successful', 5000)), dispatch(getReleases())];
      if (meta.name) {
        tasks.push(dispatch(selectRelease(meta.name)));
      }
      return Promise.all(tasks);
    })
    .catch(err => {
      if (isCancel(err)) {
        return dispatch(setSnackbar('The upload has been cancelled', 5000));
      }
      return commonErrorHandler(err, `Artifact couldn't be uploaded.`, dispatch);
    })
    .finally(() => dispatch(cleanUpUpload(uploadId)));
};

export const progress = (e, uploadId) => (dispatch, getState) => {
  let uploadProgress = (e.loaded / e.total) * 100;
  uploadProgress = uploadProgress < 50 ? Math.ceil(uploadProgress) : Math.round(uploadProgress);
  const uploads = { ...getState().app.uploadsById, [uploadId]: { ...getState().app.uploadsById[uploadId], uploadProgress } };
  return dispatch({ type: UPLOAD_PROGRESS, uploads });
};

export const cancelFileUpload = id => (dispatch, getState) => {
  const { [id]: current, ...remainder } = getState().app.uploadsById;
  current.cancelSource.abort();
  return Promise.resolve(dispatch({ type: UPLOAD_PROGRESS, uploads: remainder }));
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
        dispatch(setSnackbar('Artifact details were updated successfully.', 5000, '')),
        dispatch(getRelease(release.Name)),
        dispatch(selectRelease(release.Name))
      ]);
    });

export const removeArtifact = id => (dispatch, getState) =>
  GeneralApi.delete(`${deploymentsApiUrl}/artifacts/${id}`)
    .then(() => {
      const state = getState();
      let { release, index } = findArtifactIndexInRelease(state.releases.byId, id);
      const releaseArtifacts = [...release.Artifacts];
      releaseArtifacts.splice(index, 1);
      if (!releaseArtifacts.length) {
        const { releasesList } = state.releases;
        const releaseIds = releasesList.releaseIds.filter(id => release.Name !== id);
        return Promise.all([
          dispatch({ type: ReleaseConstants.RELEASE_REMOVED, release: release.Name }),
          dispatch(
            setReleasesListState({
              releaseIds,
              searchTotal: releasesList.searchTerm ? releasesList.searchTotal - 1 : releasesList.searchTotal,
              total: releasesList.total - 1
            })
          )
        ]);
      }
      return Promise.all([dispatch(setSnackbar('Artifact was removed', 5000, '')), dispatch({ type: ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT, release })]);
    })
    .catch(err => commonErrorHandler(err, `Error removing artifact:`, dispatch));

export const removeRelease = id => (dispatch, getState) =>
  Promise.all(getState().releases.byId[id].Artifacts.map(({ id }) => dispatch(removeArtifact(id)))).then(() => dispatch(selectRelease()));

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

export const selectRelease = release => dispatch => {
  const name = release ? release.Name || release : null;
  let tasks = [dispatch({ type: ReleaseConstants.SELECTED_RELEASE, release: name })];
  if (name) {
    tasks.push(dispatch(getRelease(name)));
  }
  return Promise.all(tasks);
};

export const setReleasesListState = selectionState => (dispatch, getState) => {
  const currentState = getState().releases.releasesList;
  let nextState = {
    ...currentState,
    ...selectionState,
    sort: { ...currentState.sort, ...selectionState.sort }
  };
  let tasks = [];
  // eslint-disable-next-line no-unused-vars
  const { isLoading: currentLoading, ...currentRequestState } = currentState;
  // eslint-disable-next-line no-unused-vars
  const { isLoading: selectionLoading, ...selectionRequestState } = nextState;
  if (!deepCompare(currentRequestState, selectionRequestState)) {
    nextState.isLoading = true;
    tasks.push(dispatch(getReleases(nextState)).finally(() => dispatch(setReleasesListState({ isLoading: false }))));
  }
  tasks.push(dispatch({ type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: nextState }));
  return Promise.all(tasks);
};

/* Releases */

const releaseListRetrieval = config => {
  const { searchTerm = '', page = defaultPage, perPage = defaultPerPage, sort = {}, selectedTags = [] } = config;
  const { key: attribute, direction } = sort;

  const sorting = attribute ? `&sort=${attribute}:${direction}`.toLowerCase() : '';
  const searchQuery = searchTerm ? `&name=${searchTerm}` : '';
  const tagQuery = selectedTags.map(tag => `&tag=${tag}`).join('');
  return GeneralApi.get(`${deploymentsApiUrl}/deployments/releases/list?page=${page}&per_page=${perPage}${searchQuery}${sorting}${tagQuery}`);
};

const deductSearchState = (receivedReleases, config, total, state) => {
  let releaseListState = { ...state.releasesList };
  const { searchTerm, searchOnly, sort = {} } = config;
  const flattenedReleases = Object.values(receivedReleases).sort(customSort(sort.direction === SORTING_OPTIONS.desc, sort.key));
  const releaseIds = flattenedReleases.map(item => item.Name);
  if (searchOnly) {
    releaseListState = { ...releaseListState, searchedIds: releaseIds };
  } else {
    releaseListState = {
      ...releaseListState,
      releaseIds,
      searchTotal: searchTerm ? total : state.releasesList.searchTotal,
      total: !searchTerm ? total : state.releasesList.total
    };
  }
  return releaseListState;
};

export const getReleases =
  (passedConfig = {}) =>
  (dispatch, getState) => {
    const config = { ...getState().releases.releasesList, ...passedConfig };
    return releaseListRetrieval(config)
      .then(({ data: receivedReleases = [], headers = {} }) => {
        const total = headers[headerNames.total] ? Number(headers[headerNames.total]) : 0;
        const state = getState().releases;
        const flatReleases = reduceReceivedReleases(receivedReleases, state.byId);
        const combinedReleases = { ...state.byId, ...flatReleases };
        let tasks = [dispatch({ type: ReleaseConstants.RECEIVE_RELEASES, releases: combinedReleases })];
        if (!getState().onboarding.complete) {
          tasks.push(dispatch({ type: SET_ONBOARDING_ARTIFACT_INCLUDED, value: !!Object.keys(receivedReleases).length }));
        }
        const releaseListState = deductSearchState(receivedReleases, config, total, state);
        tasks.push(dispatch({ type: ReleaseConstants.SET_RELEASES_LIST_STATE, value: releaseListState }));
        return Promise.all(tasks);
      })
      .catch(err => commonErrorHandler(err, `Please check your connection`, dispatch));
  };

export const getRelease = name => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/releases?name=${name}`).then(({ data: releases }) => {
    if (releases.length) {
      const stateRelease = getState().releases.byId[releases[0].Name] || {};
      return Promise.resolve(dispatch({ type: ReleaseConstants.RECEIVE_RELEASE, release: flattenRelease(releases[0], stateRelease) }));
    }
    return Promise.resolve(null);
  });
