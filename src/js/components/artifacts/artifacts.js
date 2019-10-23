import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';

import AppActions from '../../actions/app-actions';
import { AppContext } from '../../contexts/app-context';
import { preformatWithRequestID } from '../../helpers';
import AppStore from '../../stores/app-store';

import ReleaseRepository from './releaserepository';
import ReleasesList from './releaseslist';

export default class Artifacts extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      refreshArtifactsLength: 30000, //60000,
      doneLoading: false,
      ...this._getState(),
      remove: false
    };
  }
  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }
  componentDidMount() {
    this.artifactTimer = setInterval(() => this._getReleases(), this.state.refreshArtifactsLength);
    this._getReleases();
  }
  componentWillUnmount() {
    clearInterval(this.artifactTimer);
    AppStore.removeChangeListener(this._onChange.bind(this));
  }
  _getState() {
    const releases = AppStore.getReleases();
    let selectedRelease = this.state ? this.state.selectedRelease : null;
    const staleSelection = selectedRelease && !releases.find(item => item.name === selectedRelease.name);
    if (staleSelection || (!selectedRelease && releases.length)) {
      selectedRelease = releases[0];
    }
    if (this.state && this.state.releases.length < releases.length) {
      selectedRelease = releases.find(release => this.state.releases.every(item => item.Name !== release.Name));
    }
    return {
      releases,
      selectedRelease,
      showHelptips: AppStore.showHelptips()
    };
  }
  _onChange() {
    const self = this;
    let state = self._getState();
    if (this.props.params) {
      if (this.props.params.artifactVersion) {
        // selected artifacts
        var artifact = AppStore.getSoftwareArtifact('name', this.props.params.artifactVersion);
        state.selectedRelease = self.state.releases.find(item => item.Artifacts.find(releaseArtifact => releaseArtifact.id === artifact.id));
        state.selectedArtifact = artifact;
      }
    }
    self.setState(state);
  }

  onSelectRelease(release) {
    this.setState({ selectedRelease: release });
  }

  onFilterReleases(releases) {
    let selectedRelease = this.state.selectedRelease;
    if (releases && !releases.find(item => selectedRelease && selectedRelease.Name === item.Name)) {
      selectedRelease = releases.length ? releases[0] : null;
    }
    if (this.state.selectedRelease != selectedRelease) {
      this.setState({ selectedRelease });
    }
  }

  _getReleases() {
    var self = this;
    return Promise.all([AppActions.getReleases(), AppActions.getArtifacts()])
      .catch(err => {
        var errormsg = err.error || 'Please check your connection';
        AppActions.setSnackbar(errormsg, 5000, '');
        console.log(errormsg);
      })
      .finally(() => {
        self.setState({ doneLoading: true });
      });
  }
  _removeDialog(artifact) {
    AppActions.setSnackbar('');
    if (artifact) {
      this.setState({ remove: true, artifact });
    } else {
      this.setState({ remove: false, artifact: null });
    }
  }
  _removeArtifact(artifact) {
    const self = this;
    return AppActions.removeArtifact(artifact.id)
      .then(() => {
        AppActions.setSnackbar('Artifact was removed', 5000, '');
      })
      .catch(err => {
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `Error removing artifact: ${errMsg}`), null, 'Copy to clipboard');
      })
      .finally(() => self.setState({ remove: false }));
  }
  render() {
    const self = this;
    const { artifact, doneLoading, selectedRelease, showHelptips, releases, remove } = self.state;
    const { artifactProgress } = self.props;
    const currentSelectedRelease = releases.find(item => selectedRelease && item.Name === selectedRelease.Name);
    return (
      <div style={{ height: '100%' }}>
        <div className="repository">
          <ReleasesList
            releases={releases}
            selectedRelease={currentSelectedRelease}
            onSelect={release => self.onSelectRelease(release)}
            onFilter={releases => self.onFilterReleases(releases)}
            loading={!doneLoading}
          />
          <AppContext.Consumer>
            {({ uploadArtifact }) => (
              <ReleaseRepository
                artifacts={currentSelectedRelease ? currentSelectedRelease.Artifacts : []}
                uploadArtifact={uploadArtifact}
                showHelptips={showHelptips}
                removeArtifact={artifact => self._removeDialog(artifact)}
                refreshArtifacts={() => self._getReleases()}
                loading={!doneLoading}
                release={currentSelectedRelease}
                hasReleases={releases.length}
              />
            )}
          </AppContext.Consumer>
        </div>
        {artifactProgress ? (
          <div id="progressBarContainer">
            <p className="align-center">Upload in progress ({Math.round(artifactProgress)}%)</p>
            <LinearProgress variant="determinate" style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }} value={artifactProgress} />
          </div>
        ) : null}

        <Dialog open={remove}>
          <DialogTitle>Remove this artifact?</DialogTitle>
          <DialogContent>
            Are you sure you want to remove <i>{(artifact || {}).name}</i>?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this._removeDialog(null)}>Cancel</Button>
            <div style={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" onClick={() => self._removeArtifact(artifact)}>
              Remove artifact
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
