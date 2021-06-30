import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Button } from '@material-ui/core';
import { CloudUpload, InfoOutlined as InfoIcon } from '@material-ui/icons';

import { cancelFileUpload, setSnackbar } from '../../actions/appActions';
import { selectDevices } from '../../actions/deviceActions';
import { advanceOnboarding, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import {
  createArtifact,
  getReleases,
  removeArtifact,
  selectArtifact,
  selectRelease,
  showRemoveArtifactDialog,
  uploadArtifact
} from '../../actions/releaseActions';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import AddArtifactDialog from './dialogs/addartifact';
import RemoveArtifactDialog from './dialogs/removeartifact';
import ReleaseRepository from './releaserepository';
import ReleasesList from './releaseslist';

const refreshArtifactsLength = 30000; //60000

export class Artifacts extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      doneLoading: false,
      showCreateArtifactDialog: false
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.releases.length !== this.props.releases.length && this.props.releases.length) {
      const selectedRelease = this.props.releases.find(release => prevProps.releases.every(item => item.Name !== release.Name)) || this.props.releases[0];
      this.props.selectRelease(selectedRelease);
    }
    if (this.props.params && this.props.params.artifactVersion && prevProps.params && prevProps.params.artifactVersion !== this.props.params.artifactVersion) {
      // selected artifacts
      self.props.selectArtifact(this.props.params.artifactVersion);
    }
  }
  componentDidMount() {
    const self = this;
    const { artifactVersion } = self.props.match.params;
    if (!self.props.onboardingState.complete) {
      self.props.selectDevices([]);
    }
    if (!self.props.releases.length) {
      self._getReleases(artifactVersion);
    } else {
      self.setState({ doneLoading: true }, () => {
        if (artifactVersion) {
          self.props.selectRelease(artifactVersion);
        } else {
          self.props.selectRelease(self.props.releases[0]);
        }
      });
    }
    self.artifactTimer = setInterval(() => self._getReleases(), refreshArtifactsLength);
  }
  componentWillUnmount() {
    clearInterval(this.artifactTimer);
  }

  onFilterReleases(releases) {
    let selectedRelease = this.props.selectedRelease;
    if (releases && !releases.find(item => selectedRelease && selectedRelease.Name === item.Name)) {
      selectedRelease = releases.length ? releases[0] : null;
    }
    if (this.props.selectedRelease != selectedRelease) {
      this.props.selectRelease(selectedRelease);
    }
  }

  _getReleases(artifactVersion) {
    var self = this;
    return self.props.getReleases().finally(() => {
      if (artifactVersion) {
        self.props.selectRelease(artifactVersion);
      }
      self.setState({ doneLoading: true });
    });
  }

  onUploadClick() {
    if (this.props.releases.length) {
      this.props.advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP);
    }
    this.setState({ showCreateArtifactDialog: true });
  }

  _removeArtifact(artifact) {
    const self = this;
    return self.props.removeArtifact(artifact.id).finally(() => self.props.showRemoveArtifactDialog(false));
  }

  render() {
    const self = this;
    const { doneLoading, selectedFile, showCreateArtifactDialog } = self.state;
    const {
      onboardingState,
      releases,
      showRemoveDialog,
      selectedArtifact,
      selectedRelease,
      setShowCreateArtifactDialog,
      showOnboardingDialog,
      showRemoveArtifactDialog
    } = self.props;

    let uploadArtifactOnboardingComponent = null;
    if (!onboardingState.complete && self.uploadButtonRef) {
      uploadArtifactOnboardingComponent = getOnboardingComponentFor(
        onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP,
        { ...onboardingState, setShowCreateArtifactDialog },
        {
          place: 'right',
          anchor: {
            left: self.uploadButtonRef.offsetLeft + self.uploadButtonRef.offsetWidth,
            top: self.uploadButtonRef.offsetTop + self.uploadButtonRef.offsetHeight / 2
          }
        }
      );
    }

    return (
      <>
        <div className="repository">
          <div className="flexbox column leftFixed" style={{ alignItems: 'flex-start' }}>
            <ReleasesList
              releases={releases}
              selectedRelease={selectedRelease}
              onSelect={release => self.props.selectRelease(release)}
              onFilter={rels => self.onFilterReleases(rels)}
              loading={!doneLoading}
            />
            <Button
              buttonRef={ref => (this.uploadButtonRef = ref)}
              color="secondary"
              onClick={() => self.onUploadClick()}
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
            {!!uploadArtifactOnboardingComponent && !showOnboardingDialog && !showCreateArtifactDialog && uploadArtifactOnboardingComponent}
          </div>
          <ReleaseRepository
            refreshArtifacts={() => self._getReleases()}
            loading={!doneLoading}
            onUpload={selectedFile => self.setState({ selectedFile, showCreateArtifactDialog: true })}
            release={selectedRelease}
          />
        </div>
        {showRemoveDialog && (
          <RemoveArtifactDialog
            artifact={selectedArtifact.name}
            open={showRemoveDialog}
            onCancel={() => showRemoveArtifactDialog(false)}
            onRemove={() => self._removeArtifact(selectedArtifact || selectedRelease.Artifacts[0])}
          />
        )}
        {showCreateArtifactDialog && (
          <AddArtifactDialog
            {...self.props}
            onCancel={() => self.setState({ showCreateArtifactDialog: false })}
            onUploadStarted={() => self.setState({ showCreateArtifactDialog: false })}
            onUploadFinished={() => self._getReleases()}
            selectedFile={selectedFile}
          />
        )}
      </>
    );
  }
}

const actionCreators = {
  advanceOnboarding,
  cancelFileUpload,
  createArtifact,
  getReleases,
  removeArtifact,
  selectArtifact,
  selectDevices,
  selectRelease,
  setShowCreateArtifactDialog,
  setSnackbar,
  showRemoveArtifactDialog,
  uploadArtifact
};

const mapStateToProps = state => {
  const deviceTypes = state.devices.byStatus.accepted.deviceIds.slice(0, 200).reduce((accu, item) => {
    const { device_type: deviceType = '' } = state.devices.byId[item] ? state.devices.byId[item].attributes : {};
    if (deviceType.length > 0) {
      accu[deviceType] = accu[deviceType] ? accu[deviceType] + 1 : 1;
    }
    return accu;
  }, {});
  return {
    deviceTypes: Object.keys(deviceTypes),
    onboardingState: getOnboardingState(state),
    showOnboardingDialog: state.onboarding.showCreateArtifactDialog,
    pastCount: state.deployments.byStatus.finished.total,
    releases: Object.values(state.releases.byId),
    selectedArtifact: state.releases.selectedArtifact,
    selectedRelease: state.releases.selectedRelease ? state.releases.byId[state.releases.selectedRelease] : null,
    showRemoveDialog: state.releases.showRemoveDialog
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Artifacts));
