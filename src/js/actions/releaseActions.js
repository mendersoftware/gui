import ArtifactsApi from '../api/artifacts-api';
import * as ReleaseConstants from '../constants/releaseConstants';

const apiUrl = '/api/management/v1';
const deploymentsApiUrl = `${apiUrl}/deployments`;

// function _uploadArtifact(artifact) {
//   if (artifact.id) {
//     _artifactsRepo[_artifactsRepo.findIndex(item => item.id === artifact.id)] = artifact;
//   } else {
//     artifact.id = _artifactsRepo.length + 1;
//     _artifactsRepo.push(artifact);
//   }
// }

// function _uploadProgress(bool) {
//   _uploadInProgress = bool;
// }

// const removeArtifact = id => {
//   const index = _artifactsRepo.findIndex(item => item.id === id);
//   const name = _artifactsRepo[index].name;
//   _artifactsRepo.splice(index, 1);
//   const releaseIndex = _releasesRepo.findIndex(item => item.Name === name);
//   const releaseArtifactIndex = _releasesRepo[releaseIndex].Artifacts.findIndex(item => item.id === id);
//   _releasesRepo[releaseIndex].Artifacts.splice(releaseArtifactIndex, 1);
//   if (!_releasesRepo[releaseIndex].Artifacts.length) {
//     _releasesRepo.splice(releaseIndex, 1);
//   }
// };

// function setArtifactUrl(id, url) {
//   const artifact = AppStore.getSoftwareArtifact('id', id);
//   artifact.url = url;
// }

// function setReleases(releases) {
//   if (releases) {
//     _releasesRepo = releases;
//   }
//   _releasesRepo.sort(customSort(1, 'name'));
// }
// function setArtifacts(artifacts) {
//   if (artifacts) {
//     _artifactsRepo = artifacts;
//   }
//   _artifactsRepo.sort(customSort(1, 'modified'));
// }

// function _collateArtifacts() {
//   var newArray = [];
//   _artifactsRepo.forEach(repo => {
//     var x = newArray.findIndex(item => item.name === repo.name);
//     if (x > -1) {
//       newArray[x].device_types_compatible = newArray[x].device_types_compatible.concat(
//         repo.device_types_compatible.filter(item => {
//           return newArray[x].device_types_compatible.indexOf(item) < 0;
//         })
//       );
//     } else {
//       newArray.push(repo);
//     }
//   });
//   return newArray;
// }

// // discover devices with artifacts (in 'array' parameter) installed
// function discoverDevices(array) {
//   var unique = {};
//   _alldevices.forEach(device => {
//     if (typeof unique[device.artifact_name] == 'undefined') {
//       unique[device.artifact_name] = 0;
//     }
//     unique[device.artifact_name]++;
//   });

//   if (array.length) {
//     for (var val in unique) {
//       const idx = array.findIndex(item => item.name === val);
//       if (idx > -1) {
//         array[idx]['devices'] = unique[val];
//       }
//     }
//   }
//   return array;
// }

/* Artifacts */
export const getArtifacts = () => dispatch =>
  ArtifactsApi.get(`${deploymentsApiUrl}/artifacts`).then(artifacts => dispatch({ type: ReleaseConstants.RECEIVE_ARTIFACTS, artifacts }));

export const getArtifactUrl = id => dispatch =>
  ArtifactsApi.get(`${deploymentsApiUrl}/artifacts/${id}/download`).then(response =>
    dispatch({ type: ReleaseConstants.ARTIFACTS_SET_ARTIFACT_URL, id, url: response.uri })
  );

export const uploadArtifact = (meta, file, progress) => dispatch => {
  var formData = new FormData();
  formData.append('size', file.size);
  formData.append('description', meta.description);
  formData.append('artifact', file);
  return Promise.all([
    dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: true }),
    ArtifactsApi.postFormData(`${deploymentsApiUrl}/artifacts`, formData, e => progress(e.percent))
  ])
    .then(() => dispatch({ type: ReleaseConstants.UPLOAD_ARTIFACT, artifact: file }))
    .finally(() => dispatch({ type: ReleaseConstants.UPLOAD_PROGRESS, inprogress: false }));
};

export const editArtifact = (id, body) => dispatch =>
  ArtifactsApi.putJSON(`${deploymentsApiUrl}/artifacts/${id}`, body).then(() => dispatch({ type: ReleaseConstants.UPDATED_ARTIFACT, id, update: body }));

export const removeArtifact = id => dispatch =>
  ArtifactsApi.delete(`${deploymentsApiUrl}/artifacts/${id}`).then(() => dispatch({ type: ReleaseConstants.ARTIFACTS_REMOVED_ARTIFACT, id }));

/* Releases */
export const getReleases = () => dispatch =>
  ArtifactsApi.get(`${deploymentsApiUrl}/deployments/releases`).then(releases => dispatch({ type: ReleaseConstants.RECEIVE_RELEASES, releases }));
