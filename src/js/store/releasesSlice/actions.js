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
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isCancel } from 'axios';
import { v4 as uuid } from 'uuid';

import { actions, sliceName } from '.';
import { customSort, deepCompare, duplicateFilter, extractSoftwareItem } from '../../helpers';
import GeneralApi, { headerNames } from '../api/general-api';
import { constants as commonConstants, commonErrorFallback, commonErrorHandler, selectors as commonSelectors, actions as storeActions } from '../store';
import { convertDeviceListStateToFilters, progress } from '../utils';
import { ARTIFACT_GENERATION_TYPE } from './constants';
import { getReleasesById } from './selectors';

const { getFeatures, getSearchEndpoint } = commonSelectors;
const { deploymentsApiUrl, emptyFilter, DEVICE_LIST_DEFAULTS, SORTING_OPTIONS, TIMEOUTS } = commonConstants;
const { setSnackbar, initUpload, uploadProgress, cleanUpUpload, setOnboardingArtifactIncluded } = storeActions;
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

const flattenRelease = (release, stateRelease) => {
  const updatedArtifacts = release.Artifacts?.sort(customSort(1, 'modified')) || [];
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
export const getArtifactInstallCount = createAsyncThunk(`${sliceName}/getArtifactInstallCount`, (id, { dispatch, getState }) => {
  let { release, index } = findArtifactIndexInRelease(getReleasesById(getState()), id);
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
  const { hasReporting } = getFeatures(getState());
  return GeneralApi.post(getSearchEndpoint(hasReporting), {
    page: 1,
    per_page: 1,
    filters: filterTerms,
    attributes: [{ scope: 'identity', attribute: 'status' }]
  })
    .catch(err => commonErrorHandler(err, `Retrieving artifact installation count failed:`, dispatch, commonErrorFallback))
    .then(({ headers }) => {
      let { release, index } = findArtifactIndexInRelease(getReleasesById(getState()), id);
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
      return dispatch(actions.receiveRelease(release));
    });
});

export const getArtifactUrl = createAsyncThunk(`${sliceName}/getArtifactUrl`, (id, { dispatch, getState }) =>
  GeneralApi.get(`${deploymentsApiUrl}/artifacts/${id}/download`).then(response => {
    let { release, index } = findArtifactIndexInRelease(getReleasesById(getState()), id);
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
    return dispatch(actions.receiveRelease(release));
  })
);

export const createArtifact = createAsyncThunk(`${sliceName}/createArtifact`, ({ file, meta }, { dispatch }) => {
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
  formData.append('type', ARTIFACT_GENERATION_TYPE.SINGLE_FILE);
  formData.append('file', file);
  const uploadId = uuid();
  const cancelSource = new AbortController();
  return Promise.all([
    dispatch(setSnackbar('Generating artifact')),
    dispatch(initUpload({ id: uploadId, upload: { name: file.name, size: file.size, uploadProgress: 0, cancelSource } })),
    GeneralApi.upload(
      `${deploymentsApiUrl}/artifacts/generate`,
      formData,
      e => dispatch(uploadProgress({ id: uploadId, progress: progress(e) })),
      cancelSource.signal
    )
  ])
    .then(() => {
      setTimeout(() => {
        dispatch(getReleases());
        dispatch(selectRelease(meta.name));
      }, TIMEOUTS.oneSecond);
      return Promise.resolve(dispatch(setSnackbar('Upload successful', TIMEOUTS.fiveSeconds)));
    })
    .catch(err => {
      if (isCancel(err)) {
        return dispatch(setSnackbar('The artifact generation has been cancelled', TIMEOUTS.fiveSeconds));
      }
      return commonErrorHandler(err, `Artifact couldn't be generated.`, dispatch);
    })
    .finally(() => dispatch(cleanUpUpload(uploadId)));
});

export const uploadArtifact = createAsyncThunk(`${sliceName}/uploadArtifact`, ({ file, meta }, { dispatch }) => {
  let formData = new FormData();
  formData.append('size', file.size);
  formData.append('description', meta.description);
  formData.append('artifact', file);
  const uploadId = uuid();
  const cancelSource = new AbortController();
  return Promise.all([
    dispatch(setSnackbar('Uploading artifact')),
    dispatch(initUpload({ id: uploadId, upload: { name: file.name, size: file.size, uploadProgress: 0, cancelSource } })),
    GeneralApi.upload(`${deploymentsApiUrl}/artifacts`, formData, e => dispatch(uploadProgress({ id: uploadId, progress: progress(e) })), cancelSource.signal)
  ])
    .then(() => {
      const tasks = [dispatch(setSnackbar('Upload successful', TIMEOUTS.fiveSeconds)), dispatch(getReleases())];
      if (meta.name) {
        tasks.push(dispatch(selectRelease(meta.name)));
      }
      return Promise.all(tasks);
    })
    .catch(err => {
      if (isCancel(err)) {
        return dispatch(setSnackbar('The upload has been cancelled', TIMEOUTS.fiveSeconds));
      }
      return commonErrorHandler(err, `Artifact couldn't be uploaded.`, dispatch);
    })
    .finally(() => dispatch(cleanUpUpload(uploadId)));
});

export const cancelFileUpload = createAsyncThunk(`${sliceName}/cancelFileUpload`, (id, { dispatch, getState }) => {
  const { [id]: current } = getState().app.uploadsById;
  current.cancelSource.abort();
  return Promise.resolve(dispatch(cleanUpUpload(id)));
});

export const editArtifact = createAsyncThunk(`${sliceName}/editArtifact`, ({ id, body }, { dispatch, getState }) =>
  GeneralApi.put(`${deploymentsApiUrl}/artifacts/${id}`, body)
    .catch(err => commonErrorHandler(err, `Artifact details couldn't be updated.`, dispatch))
    .then(() => {
      const state = getState();
      let { release, index } = findArtifactIndexInRelease(getReleasesById(state), id);
      if (!release || index === -1) {
        return dispatch(getReleases());
      }
      release.Artifacts[index].description = body.description;
      return Promise.all([
        dispatch(actions.receiveRelease(release)),
        dispatch(setSnackbar('Artifact details were updated successfully.', TIMEOUTS.fiveSeconds, '')),
        dispatch(getRelease(release.Name)),
        dispatch(selectRelease(release.Name))
      ]);
    })
);

export const removeArtifact = createAsyncThunk(`${sliceName}/removeArtifact`, (id, { dispatch, getState }) =>
  GeneralApi.delete(`${deploymentsApiUrl}/artifacts/${id}`)
    .then(() => {
      let { release, index } = findArtifactIndexInRelease(getReleasesById(getState()), id);
      const releaseArtifacts = [...release.Artifacts];
      releaseArtifacts.splice(index, 1);
      if (!releaseArtifacts.length) {
        const { releasesList } = getState().releases;
        const releaseIds = releasesList.releaseIds.filter(id => release.Name !== id);
        return Promise.all([
          dispatch(actions.removeRelease(release.Name)),
          dispatch(
            setReleasesListState({
              releaseIds,
              searchTotal: releasesList.searchTerm ? releasesList.searchTotal - 1 : releasesList.searchTotal,
              total: releasesList.total - 1
            })
          )
        ]);
      }
      return Promise.all([dispatch(setSnackbar('Artifact was removed', TIMEOUTS.fiveSeconds, '')), dispatch(actions.receiveRelease(release))]);
    })
    .catch(err => commonErrorHandler(err, `Error removing artifact:`, dispatch))
);

export const removeRelease = createAsyncThunk(`${sliceName}/removeRelease`, (releaseId, { dispatch, getState }) =>
  Promise.all(getReleasesById(getState())[releaseId].Artifacts.map(({ id }) => dispatch(removeArtifact(id)))).then(() => dispatch(selectRelease()))
);

export const selectArtifact = createAsyncThunk(`${sliceName}/selectArtifact`, (artifact, { dispatch, getState }) => {
  if (!artifact) {
    return dispatch(actions.selectedArtifact(artifact));
  }
  const artifactName = artifact.hasOwnProperty('id') ? artifact.id : artifact;
  const release = Object.values(getReleasesById(getState())).find(item => item.Artifacts.find(releaseArtifact => releaseArtifact.id === artifactName));
  if (release) {
    const selectedArtifact = release.Artifacts.find(releaseArtifact => releaseArtifact.id === artifactName);
    let tasks = [dispatch(actions.selectedArtifact(selectedArtifact))];
    if (release.Name !== getState().releases.selectedRelease) {
      tasks.push(dispatch(actions.selectedRelease(release.Name)));
    }
    return Promise.all(tasks);
  }
});

export const selectRelease = createAsyncThunk(`${sliceName}/selectRelease`, (release, { dispatch }) => {
  const name = release ? release.Name || release : null;
  let tasks = [dispatch(actions.selectedRelease(name))];
  if (name) {
    tasks.push(dispatch(getRelease(name)));
  }
  return Promise.all(tasks);
});

export const setReleasesListState = createAsyncThunk(`${sliceName}/setReleasesListState`, (selectionState, { dispatch, getState }) => {
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
  tasks.push(dispatch(actions.setReleaseListState(nextState)));
  return Promise.all(tasks);
});

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

export const getReleases = createAsyncThunk(`${sliceName}/getReleases`, (passedConfig = {}, { dispatch, getState }) => {
  const config = { ...getState().releases.releasesList, ...passedConfig };
  return releaseListRetrieval(config)
    .then(({ data: receivedReleases = [], headers = {} }) => {
      const total = headers[headerNames.total] ? Number(headers[headerNames.total]) : 0;
      const state = getState().releases;
      const flatReleases = reduceReceivedReleases(receivedReleases, state.byId);
      const combinedReleases = { ...state.byId, ...flatReleases };
      let tasks = [dispatch(actions.receiveReleases(combinedReleases))];
      if (!getState().onboarding.complete) {
        tasks.push(dispatch(setOnboardingArtifactIncluded(!!Object.keys(receivedReleases).length)));
      }
      const releaseListState = deductSearchState(receivedReleases, config, total, state);
      tasks.push(dispatch(actions.setReleaseListState(releaseListState)));
      return Promise.all(tasks);
    })
    .catch(err => commonErrorHandler(err, `Please check your connection`, dispatch));
});

export const getRelease = createAsyncThunk(`${sliceName}/getReleases`, (name, { dispatch, getState }) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/releases?name=${name}`).then(({ data: releases }) => {
    if (releases.length) {
      const stateRelease = getState().releases.byId[releases[0].Name] || {};
      return Promise.resolve(dispatch(actions.receiveRelease(flattenRelease(releases[0], stateRelease))));
    }
    return Promise.resolve(null);
  })
);
