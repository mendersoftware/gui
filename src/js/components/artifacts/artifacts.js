import React from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress } from '@material-ui/core';

import AppActions from '../../actions/app-actions';
import { getReleases, removeArtifact, selectArtifact, selectRelease, showRemoveArtifactDialog } from '../../actions/releaseActions';
import { preformatWithRequestID } from '../../helpers';
import AppStore from '../../stores/app-store';

import ReleaseRepository from './releaserepository';
import ReleasesList from './releaseslist';

export class Artifacts extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      refreshArtifactsLength: 30000, //60000,
      doneLoading: false,
      remove: false
    };
  }
  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }
  componentDidUpdate(prevProps) {
    if (prevProps.releases.length !== this.props.releases.length) {
      const selectedRelease = this.props.releases.find(release => prevProps.releases.every(item => item.Name !== release.Name));
      this.props.selectArtifact(selectedRelease.Artifacts[0]);
    }
  }
  componentDidMount() {
    this.artifactTimer = setInterval(() => this._getReleases(), this.state.refreshArtifactsLength);
    this._getReleases();
  }
  componentWillUnmount() {
    clearInterval(this.artifactTimer);
    AppStore.removeChangeListener(this._onChange.bind(this));
  }

  _onChange() {
    const self = this;
    if (this.props.params && this.props.params.artifactVersion) {
      // selected artifacts
      self.props.selectArtifact(this.props.params.artifactVersion);
    }
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

  _getReleases() {
    var self = this;
    return self.props
      .getReleases()
      .catch(err => {
        var errormsg = err.error || 'Please check your connection';
        AppActions.setSnackbar(errormsg, 5000, '');
        console.log(errormsg);
      })
      .finally(() => {
        self.setState({ doneLoading: true });
      });
  }

  _removeArtifact(artifact) {
    const self = this;
    return self.props
      .removeArtifact(artifact.id)
      .then(() => {
        AppActions.setSnackbar('Artifact was removed', 5000, '');
      })
      .catch(err => {
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `Error removing artifact: ${errMsg}`), null, 'Copy to clipboard');
      })
      .finally(() => self.props.showRemoveArtifactDialog(false));
  }
  render() {
    const self = this;
    const { artifact, doneLoading } = self.state;
    const { artifactProgress, releases, showRemoveDialog, selectedArtifact, selectedRelease, showRemoveArtifactDialog } = self.props;
    return (
      <div style={{ height: '100%' }}>
        <div className="repository">
          <ReleasesList
            releases={releases}
            selectedRelease={selectedRelease}
            onSelect={release => self.props.selectRelease(release)}
            onFilter={rels => self.onFilterReleases(rels)}
            loading={!doneLoading}
          />
          <ReleaseRepository refreshArtifacts={() => self._getReleases()} loading={!doneLoading} release={selectedRelease} />
        </div>
        {artifactProgress ? (
          <div id="progressBarContainer">
            <p className="align-center">Upload in progress ({Math.round(artifactProgress)}%)</p>
            <LinearProgress variant="determinate" style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }} value={artifactProgress} />
          </div>
        ) : null}

        <Dialog open={showRemoveDialog}>
          <DialogTitle>Remove this artifact?</DialogTitle>
          <DialogContent>
            Are you sure you want to remove <i>{(artifact || {}).name}</i>?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => showRemoveArtifactDialog(false)}>Cancel</Button>
            <div style={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" onClick={() => self._removeArtifact(selectedArtifact || artifact || selectedRelease.Artifacts[0])}>
              Remove artifact
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const actionCreators = { getReleases, removeArtifact, selectArtifact, selectRelease, showRemoveArtifactDialog };

const mapStateToProps = state => {
  return {
    releases: Object.values(state.releases.byId),
    artifactProgress: state.releases.uploadProgress,
    selectedArtifact: state.releases.selectedArtifact,
    selectedRelease: state.releases.selectedRelease ? state.releases.byId[state.releases.selectedRelease] : null,
    showRemoveDialog: state.releases.showRemoveDialog
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(Artifacts);
