import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Button } from '@mui/material';
import { CloudUpload, InfoOutlined as InfoIcon } from '@mui/icons-material';

import { cancelFileUpload, setSnackbar } from '../../actions/appActions';
import { advanceOnboarding, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import { createArtifact, getReleases, removeArtifact, selectRelease, setReleasesListState, uploadArtifact } from '../../actions/releaseActions';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import AddArtifactDialog from './dialogs/addartifact';
import ReleaseRepository from './releaserepository';
import ReleasesList from './releaseslist';
import { useDebounce } from '../../utils/debouncehook';
import { defaultVisibleSection } from '../../constants/releaseConstants';

const refreshArtifactsLength = 60000;

export const Artifacts = props => {
  const {
    getReleases,
    history,
    match,
    onboardingState,
    releases,
    releasesListState,
    selectedRelease,
    selectRelease,
    setReleasesListState,
    setShowCreateArtifactDialog
  } = props;

  const [doneLoading, setDoneLoading] = useState(!!releases.length);
  const [selectedFile, setSelectedFile] = useState();
  const [showAddArtifactDialog, setShowAddArtifactDialog] = useState(false);
  const uploadButtonRef = useRef();
  const artifactTimer = useRef();

  const { searchTerm, sort = {}, visibleSection = {} } = releasesListState;
  const debouncedSearchTerm = useDebounce(searchTerm, 700);

  useEffect(() => {
    clearInterval(artifactTimer.current);
    artifactTimer.current = setInterval(onGetReleases, refreshArtifactsLength);
    onGetReleases();
    return () => {
      clearInterval(artifactTimer.current);
    };
  }, [debouncedSearchTerm, sort.attribute, sort.direction, visibleSection.start]);

  useEffect(() => {
    if (!releases.length) {
      return;
    }
    if (selectedRelease) {
      history.replace(`/releases/${encodeURIComponent(selectedRelease.Name)}`);
      return;
    }
    selectRelease(releases[0]);
  }, [releases.length, selectedRelease]);

  useEffect(() => {
    const { artifactVersion } = match.params;
    setReleasesListState({ visibleSection: { ...defaultVisibleSection } });
    if (artifactVersion) {
      selectRelease(decodeURIComponent(artifactVersion));
    }
    return () => {
      setReleasesListState({ visibleSection: { ...defaultVisibleSection } });
      clearInterval(artifactTimer.current);
    };
  }, []);

  const onGetReleases = artifactVersion =>
    getReleases({ visibleSection }).finally(() => {
      if (artifactVersion) {
        selectRelease(artifactVersion);
      }
      setDoneLoading(true);
    });

  const onUploadClick = () => {
    if (releases.length) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP);
    }
    setShowAddArtifactDialog(true);
  };

  const onFileUploadClick = selectedFile => {
    setSelectedFile(selectedFile);
    setShowAddArtifactDialog(true);
  };

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
        <div className="flexbox column leftFixed">
          <ReleasesList
            loading={!doneLoading}
            releases={releases}
            releasesListState={releasesListState}
            selectedRelease={selectedRelease}
            setReleasesListState={setReleasesListState}
            onSelect={selectRelease}
          />
          <Button
            buttonRef={uploadButtonRef}
            color="secondary"
            onClick={onUploadClick}
            startIcon={<CloudUpload fontSize="small" />}
            style={{ marginTop: 30, minWidth: 164, justifySelf: 'left' }}
            variant="contained"
          >
            Upload
          </Button>
          <p className="info flexbox center-aligned">
            <InfoIcon fontSize="small" />
            Upload an Artifact to an existing or new Release
          </p>
          {!!uploadArtifactOnboardingComponent && !showAddArtifactDialog && uploadArtifactOnboardingComponent}
        </div>
        <ReleaseRepository refreshArtifacts={onGetReleases} loading={!doneLoading} onUpload={onFileUploadClick} />
      </div>
      {showAddArtifactDialog && (
        <AddArtifactDialog
          {...props}
          onCancel={() => setShowAddArtifactDialog(false)}
          onUploadStarted={() => setShowAddArtifactDialog(false)}
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
  selectRelease,
  setReleasesListState,
  setShowCreateArtifactDialog,
  setSnackbar,
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
    releases: state.releases.releasesList.releaseIds.map(id => state.releases.byId[id]),
    selectedArtifact: state.releases.selectedArtifact,
    selectedRelease: state.releases.byId[state.releases.selectedRelease],
    releasesListState: state.releases.releasesList,
    showRemoveDialog: state.releases.showRemoveDialog
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Artifacts));
