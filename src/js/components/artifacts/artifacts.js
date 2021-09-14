import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Button } from '@material-ui/core';
import { CloudUpload, InfoOutlined as InfoIcon } from '@material-ui/icons';

import { cancelFileUpload, setSnackbar } from '../../actions/appActions';
import { setDeviceListState } from '../../actions/deviceActions';
import { advanceOnboarding, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import { createArtifact, getReleases, removeArtifact, selectRelease, showRemoveArtifactDialog, uploadArtifact } from '../../actions/releaseActions';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import AddArtifactDialog from './dialogs/addartifact';
import RemoveArtifactDialog from './dialogs/removeartifact';
import ReleaseRepository from './releaserepository';
import ReleasesList from './releaseslist';

const refreshArtifactsLength = 30000; //60000

let artifactTimer;

export const Artifacts = props => {
  const {
    getReleases,
    match,
    onboardingState,
    releases,
    removeArtifact,
    selectedArtifact,
    selectedRelease,
    selectRelease,
    setShowCreateArtifactDialog,
    showCreateArtifactDialog,
    showRemoveArtifactDialog,
    showRemoveDialog
  } = props;

  const [doneLoading, setDoneLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const uploadButtonRef = useRef();

  useEffect(() => {
    if (!releases.length) {
      return;
    }
    if (selectedRelease) {
      window.location.replace(`#/releases/${selectedRelease.Name}`);
      return;
    }
    selectRelease(releases[0]);
  }, [releases.length, selectedRelease]);

  useEffect(() => {
    if (!match.params.artifactVersion) {
      return;
    }
    // selected artifacts
    selectRelease(match.params.artifactVersion);
  }, [match.params.artifactVersion]);

  useEffect(() => {
    const { artifactVersion } = match.params;
    if (!releases.length) {
      onGetReleases(artifactVersion);
    } else {
      setDoneLoading(true);
    }
    artifactTimer = setInterval(onGetReleases, refreshArtifactsLength);
    return () => {
      clearInterval(artifactTimer);
    };
  }, []);

  const onFilterReleases = releases => {
    let selectedRelease = { ...props.selectedRelease };
    if (releases && !releases.find(item => selectedRelease && selectedRelease.Name === item.Name)) {
      selectedRelease = releases.length ? releases[0] : null;
    }
    if (selectedRelease != props.selectedRelease) {
      selectRelease(selectedRelease);
    }
  };

  const onGetReleases = artifactVersion =>
    getReleases().finally(() => {
      if (artifactVersion) {
        selectRelease(artifactVersion);
      }
      setDoneLoading(true);
    });

  const onUploadClick = () => {
    if (releases.length) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP);
    }
    setShowCreateArtifactDialog(true);
  };

  const onFileUploadClick = selectedFile => {
    setSelectedFile(selectedFile);
    setShowCreateArtifactDialog(true);
  };

  const onRemoveArtifact = artifact => removeArtifact(artifact.id).finally(() => showRemoveArtifactDialog(false));

  let uploadArtifactOnboardingComponent = null;
  if (!onboardingState.complete && uploadButtonRef.current) {
    uploadArtifactOnboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP,
      { ...onboardingState, setShowCreateArtifactDialog },
      {
        place: 'right',
        anchor: {
          left: uploadButtonRef.current.offsetLeft + uploadButtonRef.current.offsetWidth,
          top: uploadButtonRef.current.offsetTop + uploadButtonRef.current.offsetHeight / 2
        }
      }
    );
  }

  const onUploadFinished = releaseName => getReleases().then(() => selectRelease(releaseName));

  return (
    <>
      <div className="repository">
        <div className="flexbox column leftFixed" style={{ alignItems: 'flex-start' }}>
          <ReleasesList releases={releases} selectedRelease={selectedRelease} onSelect={selectRelease} onFilter={onFilterReleases} loading={!doneLoading} />
          <Button
            buttonRef={uploadButtonRef}
            color="secondary"
            onClick={onUploadClick}
            startIcon={<CloudUpload fontSize="small" />}
            style={{ marginTop: 30, minHeight: 'min-content', minWidth: 164 }}
            variant="contained"
          >
            Upload
          </Button>
          <p className="info flexbox center-aligned">
            <InfoIcon fontSize="small" />
            Upload an Artifact to an existing or new Release
          </p>
          {!!uploadArtifactOnboardingComponent && !showCreateArtifactDialog && uploadArtifactOnboardingComponent}
        </div>
        <ReleaseRepository refreshArtifacts={onGetReleases} loading={!doneLoading} onUpload={onFileUploadClick} release={selectedRelease} />
      </div>
      {showRemoveDialog && (
        <RemoveArtifactDialog
          artifact={selectedArtifact.name}
          open={showRemoveDialog}
          onCancel={() => showRemoveArtifactDialog(false)}
          onRemove={() => onRemoveArtifact(selectedArtifact || selectedRelease.Artifacts[0])}
        />
      )}
      {showCreateArtifactDialog && (
        <AddArtifactDialog
          {...props}
          onCancel={() => setShowCreateArtifactDialog(false)}
          onUploadStarted={() => setShowCreateArtifactDialog(false)}
          onUploadFinished={onUploadFinished}
          selectedFile={selectedFile}
        />
      )}
    </>
  );
};

const actionCreators = {
  advanceOnboarding,
  cancelFileUpload,
  createArtifact,
  getReleases,
  removeArtifact,
  setDeviceListState,
  selectRelease,
  setShowCreateArtifactDialog,
  setSnackbar,
  showRemoveArtifactDialog,
  uploadArtifact
};

const mapStateToProps = state => {
  const deviceTypes = state.devices.byStatus.accepted.deviceIds.slice(0, 200).reduce((accu, item) => {
    const { device_type: deviceTypes = [] } = state.devices.byId[item] ? state.devices.byId[item].attributes : {};
    accu = deviceTypes.reduce((deviceTypeAccu, deviceType) => {
      if (deviceType.length > 1) {
        deviceTypeAccu[deviceType] = deviceTypeAccu[deviceType] ? deviceTypeAccu[deviceType] + 1 : 1;
      }
      return deviceTypeAccu;
    }, accu);
    return accu;
  }, {});
  return {
    deviceTypes: Object.keys(deviceTypes),
    onboardingState: getOnboardingState(state),
    pastCount: state.deployments.byStatus.finished.total,
    releases: Object.values(state.releases.byId),
    selectedArtifact: state.releases.selectedArtifact,
    selectedRelease: state.releases.selectedRelease ? state.releases.byId[state.releases.selectedRelease] : null,
    showCreateArtifactDialog: state.onboarding.showCreateArtifactDialog,
    showRemoveDialog: state.releases.showRemoveDialog
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Artifacts));
