import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Button, LinearProgress } from '@material-ui/core';

import { CloudUpload, InfoOutlined as InfoIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { selectDevices } from '../../actions/deviceActions';
import {
  createArtifact,
  getReleases,
  removeArtifact,
  selectArtifact,
  selectRelease,
  showRemoveArtifactDialog,
  uploadArtifact
} from '../../actions/releaseActions';
import { advanceOnboarding, getOnboardingComponentFor, getOnboardingStepCompleted } from '../../utils/onboardingmanager';

import ReleaseRepository from './releaserepository';
import ReleasesList from './releaseslist';
import RemoveArtifactDialog from './dialogs/removeartifact';
import AddArtifactDialog from './dialogs/addartifact';

const refreshArtifactsLength = 30000; //60000

export class Artifacts extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      doneLoading: false,
      remove: false,
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
    if (!self.props.onboardingComplete) {
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

  addArtifact(meta, file, type = 'upload') {
    const self = this;
    const upload = type === 'create' ? this.props.createArtifact(meta, file) : this.props.uploadArtifact(meta, file);
    return self.setState({ showCreateArtifactDialog: false }, () =>
      upload.then(() => {
        if (!self.props.onboardingComplete && getOnboardingStepCompleted('artifact-included-deploy-onboarding')) {
          advanceOnboarding('upload-new-artifact-tip');
          if (type === 'create' && getOnboardingStepCompleted('upload-new-artifact-dialog-device-type')) {
            advanceOnboarding('upload-new-artifact-dialog-release-name');
          }
        }
        return setTimeout(() => self._getReleases(), 2000);
      })
    );
  }

  _removeArtifact(artifact) {
    const self = this;
    return self.props.removeArtifact(artifact.id).finally(() => self.props.showRemoveArtifactDialog(false));
  }

  render() {
    const self = this;
    const { artifact, doneLoading, selectedFile, showCreateArtifactDialog } = self.state;
    const {
      artifactProgress,
      deviceTypes,
      onboardingComplete,
      releases,
      showRemoveDialog,
      selectedArtifact,
      selectedRelease,
      setSnackbar,
      showOnboardingDialog,
      showRemoveArtifactDialog
    } = self.props;

    let uploadArtifactOnboardingComponent = null;
    if (!onboardingComplete && self.uploadButtonRef) {
      uploadArtifactOnboardingComponent = getOnboardingComponentFor('upload-new-artifact-tip', {
        place: 'right',
        anchor: {
          left: self.uploadButtonRef.offsetLeft + self.uploadButtonRef.offsetWidth,
          top: self.uploadButtonRef.offsetTop + self.uploadButtonRef.offsetHeight / 2
        }
      });
    }

    return (
      <div style={{ height: '100%' }}>
        <div className="repository">
          <div>
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
              onClick={() => self.setState({ showCreateArtifactDialog: true })}
              startIcon={<CloudUpload fontSize="small" />}
              style={{ minWidth: 164 }}
              variant="contained"
            >
              Upload
            </Button>
            <p className="info flexbox" style={{ alignItems: 'center' }}>
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
        {artifactProgress ? (
          <div id="progressBarContainer">
            <p className="align-center">Upload in progress ({Math.round(artifactProgress)}%)</p>
            <LinearProgress variant="determinate" style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }} value={artifactProgress} />
          </div>
        ) : null}
        {showRemoveDialog && (
          <RemoveArtifactDialog
            artifact={(artifact || {}).name}
            open={showRemoveDialog}
            onCancel={() => showRemoveArtifactDialog(false)}
            onRemove={() => self._removeArtifact(selectedArtifact || artifact || selectedRelease.Artifacts[0])}
          />
        )}
        {showCreateArtifactDialog && (
          <AddArtifactDialog
            selectedFile={selectedFile}
            setSnackbar={setSnackbar}
            deviceTypes={deviceTypes}
            open={showCreateArtifactDialog}
            onboardingComplete={onboardingComplete}
            onCancel={() => self.setState({ showCreateArtifactDialog: false })}
            onCreate={(meta, file) => self.addArtifact(meta, file, 'create')}
            onUpload={(meta, file) => self.addArtifact(meta, file, 'upload')}
          />
        )}
      </div>
    );
  }
}

const actionCreators = {
  createArtifact,
  getReleases,
  removeArtifact,
  selectArtifact,
  selectDevices,
  selectRelease,
  setSnackbar,
  showRemoveArtifactDialog,
  uploadArtifact
};

const mapStateToProps = state => {
  const deviceTypes = state.devices.byStatus.accepted.deviceIds.slice(0, 200).reduce((accu, item) => {
    const deviceType = state.devices.byId[item] ? state.devices.byId[item].attributes.device_type : '';
    if (deviceType.length > 0) {
      accu[deviceType] = accu[deviceType] ? accu[deviceType] + 1 : 1;
    }
    return accu;
  }, {});
  return {
    artifactProgress: state.releases.uploadProgress,
    deviceTypes: Object.keys(deviceTypes),
    onboardingComplete: state.users.onboarding.complete,
    showOnboardingDialog: state.users.onboarding.showCreateArtifactDialog,
    releases: Object.values(state.releases.byId),
    selectedArtifact: state.releases.selectedArtifact,
    selectedRelease: state.releases.selectedRelease ? state.releases.byId[state.releases.selectedRelease] : null,
    showRemoveDialog: state.releases.showRemoveDialog
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Artifacts));
