import { isCancel } from 'axios';
import { v4 as uuid } from 'uuid';

import { commonErrorHandler, setSnackbar } from '../actions/appActions';
import GeneralApi, { headerNames } from '../api/general-api';
import { SORTING_OPTIONS, UPLOAD_PROGRESS } from '../constants/appConstants';
import { SET_ONBOARDING_ARTIFACT_INCLUDED } from '../constants/onboardingConstants';
import * as ReleaseConstants from '../constants/releaseConstants';
import { customSort, duplicateFilter } from '../helpers';
import { deploymentsApiUrl } from './deploymentActions';

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
    .then(() => Promise.resolve(dispatch(setSnackbar('Upload successful', 5000))))
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
    .then(() => Promise.resolve(dispatch(setSnackbar('Upload successful', 5000))))
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
        dispatch(setSnackbar('Artifact details were updated successfully.', 5000, ''))
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

export const selectRelease = release => dispatch =>
  Promise.resolve(dispatch({ type: ReleaseConstants.SELECTED_RELEASE, release: release ? release.Name || release : null }));

export const setReleasesListState = selectionState => (dispatch, getState) =>
  Promise.resolve(
    dispatch({
      type: ReleaseConstants.SET_RELEASES_LIST_STATE,
      value: {
        ...getState().releases.releasesList,
        ...selectionState,
        sort: {
          ...getState().releases.releasesList.sort,
          ...selectionState.sort
        }
      }
    })
  );

/* Releases */
const searchAttributes = ['name', 'device_type', 'description'];

function* generateReleaseSearchQuery(search, searchAttribute) {
  if (!search) {
    return;
  }
  if (searchAttribute) {
    return `&${searchAttribute}=${search}`;
  }
  yield `&${searchAttributes[0]}=${search}`;
  yield `&${searchAttributes[1]}=${search}`;
  yield `&${searchAttributes[2]}=${search}`;
}

const releaseListRetrieval = (config, queryGenerator) => {
  const { page, perPage, sort = {} } = config;
  const { key: attribute, direction } = sort;

  const perPageQuery = perPage ? `&per_page=${perPage}` : '';
  const sorting = attribute ? `&sort=${attribute}:${direction}`.toLowerCase() : '';
  const searchQuery = queryGenerator.next().value ?? '';
  return GeneralApi.get(`${deploymentsApiUrl}/deployments/releases/list?page=${page}${perPageQuery}${searchQuery}${sorting}`);
};

const zipReleaseLists = (stateReleaseIds, newReleases, offset) =>
  newReleases.reduce(
    (accu, release, index) => {
      accu[index + offset] = release.Name || release;
      return accu;
    },
    [...stateReleaseIds]
  );

const releaseListProcessing = (props = {}) => {
  const { data: receivedReleases, headers } = props;
  if (!headers) {
    return Promise.resolve(props);
  }
  return Promise.resolve({ receivedReleases, total: Number(headers[headerNames.total]) });
};

const maybeTriggerRetrieval = (config, queryGenerator) => results => {
  if (results.receivedReleases?.length) {
    return Promise.resolve(results);
  }
  return releaseListRetrieval(config, queryGenerator);
};

const deductSearchState = (searchAttribute, queryGenerator, searchTerm, receivedReleases, config, searchOnly, total, state) => {
  let releaseListState = {};
  if (!!Object.keys(receivedReleases).length && !searchAttribute) {
    const nextGeneratorResult = queryGenerator.next().value ?? '';
    const index = searchAttributes.findIndex(attribute => nextGeneratorResult.includes(attribute));
    const searchAttribute = index > 0 ? searchAttributes[index - 1] : searchAttributes[searchAttributes.length - 1];
    releaseListState = { ...releaseListState, searchAttribute: searchTerm ? searchAttribute : searchAttributes[0] };
  }
  const flattenedReleases = Object.values(receivedReleases).sort(customSort(config.sort.direction === SORTING_OPTIONS.desc, config.sort.key));
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
    let config = { ...getState().releases.releasesList, ...passedConfig };
    const { searchAttribute, searchOnly, searchTerm = '' } = config;
    if (passedConfig.visibleSection?.start && searchAttribute) {
      return Promise.resolve(dispatch(refreshReleases(passedConfig)));
    }
    config = searchOnly ? { ...config, sort: { key: 'Name', direction: SORTING_OPTIONS.asc } } : config;
    const queryGenerator = generateReleaseSearchQuery(searchTerm, passedConfig.searchAttribute);

    return releaseListRetrieval(config, queryGenerator) // first we look for name matches
      .then(releaseListProcessing)
      .then(maybeTriggerRetrieval(config, queryGenerator)) // if none found, we look for device_type matches
      .then(releaseListProcessing)
      .then(maybeTriggerRetrieval(config, queryGenerator)) // if none found, we look for description matches
      .then(releaseListProcessing)
      .then(({ receivedReleases = [], total = 0 }) => {
        const state = getState().releases;
        const flatReleases = reduceReceivedReleases(receivedReleases, state.byId);
        const combinedReleases = { ...state.byId, ...flatReleases };
        let tasks = [dispatch({ type: ReleaseConstants.RECEIVE_RELEASES, releases: combinedReleases })];
        if (!getState().onboarding.complete) {
          tasks.push(dispatch({ type: SET_ONBOARDING_ARTIFACT_INCLUDED, value: !!Object.keys(receivedReleases).length }));
        }
        const releaseListState = deductSearchState(searchAttribute, queryGenerator, searchTerm, receivedReleases, config, searchOnly, total, state);
        tasks.push(dispatch(setReleasesListState(releaseListState)));

        return Promise.all(tasks);
      })
      .catch(err => commonErrorHandler(err, `Please check your connection`, dispatch));
  };

const possiblePageSizes = [10, 20, 50, 100, 250, 500];
const getBestPageSize = itemCount =>
  possiblePageSizes.reduce(
    (accu, pageSize) => {
      const distance = Math.abs(1 - Math.max(itemCount, 1) / pageSize);
      if (accu.distance > distance && pageSize >= itemCount) {
        return { pageSize, distance };
      }
      return accu;
    },
    { pageSize: possiblePageSizes[0], distance: possiblePageSizes[possiblePageSizes.length - 1] }
  ).pageSize;

export const refreshReleases = config => (dispatch, getState) => {
  const storedConfig = { ...getState().releases.releasesList, ...config };
  const { searchAttribute, searchTerm, visibleSection } = storedConfig;
  const { start, end } = visibleSection;

  const queryGenerator = {
    next: () => ({ value: searchTerm ? `&${searchAttribute}=${searchTerm}` : '' })
  };

  const perPage = getBestPageSize(end - start);
  const page = Math.max(Math.floor(start / perPage) + (start % perPage ? 0 : 1), 1);
  const offset = (page - 1) * perPage;
  const refreshAllReleases = ({ page: currentPage, ...refreshConfig }, generator, releases = {}) => {
    return releaseListRetrieval({ ...refreshConfig, page: currentPage }, generator).then(({ data: retrievedReleases }) => {
      const flatReleases = reduceReceivedReleases(retrievedReleases, getState().releases.byId);
      dispatch({ type: ReleaseConstants.RECEIVE_RELEASES, releases: { ...getState().releases.byId, ...flatReleases } });
      const combinedReleases = { ...releases, ...flatReleases };
      if (currentPage * perPage > end) {
        return Promise.resolve(combinedReleases);
      }
      return refreshAllReleases({ ...refreshConfig, page: currentPage + 1 }, generator, combinedReleases);
    });
  };

  return refreshAllReleases({ ...storedConfig, page, perPage }, queryGenerator).then(refreshedReleasesById => {
    const releaseIds = zipReleaseLists(getState().releases.releasesList.releaseIds, Object.values(refreshedReleasesById), offset);
    const currentPage = Math.floor(releaseIds.length / storedConfig.perPage);
    return Promise.resolve(dispatch(setReleasesListState({ page: currentPage, releaseIds })));
  });
};

export const getRelease = name => (dispatch, getState) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/releases?name=${name}`).then(({ data: releases }) => {
    if (releases.length) {
      const stateRelease = getState().releases.byId[releases[0].Name] || {};
      return Promise.resolve(dispatch({ type: ReleaseConstants.RECEIVE_RELEASE, release: flattenRelease(releases[0], stateRelease) }));
    }
    return Promise.resolve(null);
  });
