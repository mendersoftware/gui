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
    this.state = this._getState();
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
  componentDidUpdate(prevProps) {
    if (prevProps.artifactProgress && !this.props.artifactProgress) {
      clearInterval(this.artifactTimer);
      this.artifactTimer = setInterval(() => this._getReleases(), this.state.refreshArtifactsLength);
      this._getReleases();
    }
  }
  _getState() {
    return {
      releases: AppStore.getReleases(),
      remove: false,
      refreshArtifactsLength: 60000,
      showHelptips: AppStore.showHelptips()
    };
  }
  _onChange() {
    this.setState(this._getState());
    if (this.props.params) {
      if (this.props.params.artifactVersion) {
        // selected artifacts
        var artifact = AppStore.getSoftwareArtifact('name', this.props.params.artifactVersion);
        const selectedRelease = this.state.releases.find(item => item.Artifacts.find(releaseArtifact => releaseArtifact.id === artifact.id));
        this.setState({ selectedRelease, selectedArtifact: artifact });
      }
    }
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

  _startLoading(bool) {
    this.setState({ doneLoading: !bool });
  }
  _getReleases() {
    var self = this;
    return AppActions.getReleases()
      .then(releases => {
        let selectedRelease = self.state.selectedRelease;
        if (!selectedRelease && releases.length) {
          selectedRelease = releases[0];
        }
        self.setState({ releases, selectedRelease });
      })
      .catch(err => {
        var errormsg = err.error || 'Please check your connection';
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
    var self = this;
    return AppActions.removeArtifact(artifact.id)
      .then(() => {
        AppActions.setSnackbar('Artifact was removed', 5000, '');
        self._getReleases();
      })
      .catch(err => {
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `Error removing artifact: ${errMsg}`), null, 'Copy to clipboard');
      });
  }
  render() {
    const self = this;

    return (
      <div style={{ height: '100%' }}>
        <div className="flexbox" style={{ height: '100%' }}>
          <ReleasesList
            releases={self.state.releases}
            selectedRelease={self.state.selectedRelease}
            onSelect={release => self.onSelectRelease(release)}
            onFilter={releases => self.onFilterReleases(releases)}
            loading={!self.state.doneLoading}
          />
          <AppContext.Consumer>
            {({ uploadArtifact }) => (
              <ReleaseRepository
                uploadArtifact={uploadArtifact}
                progress={self.props.artifactProgress}
                showHelptips={self.state.showHelptips}
                removeArtifact={artifact => this._removeDialog(artifact)}
                refreshArtifacts={self._getReleases}
                startLoader={self._startLoading}
                loading={!self.state.doneLoading}
                release={self.state.selectedRelease}
                hasReleases={self.state.releases.length}
              />
            )}
          </AppContext.Consumer>
        </div>
        {self.props.artifactProgress ? (
          <div id="progressBarContainer">
            <p className="align-center">Upload in progress ({Math.round(self.props.artifactProgress)}%)</p>
            <LinearProgress variant="determinate" style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }} value={self.props.artifactProgress} />
          </div>
        ) : null}

        <Dialog open={this.state.remove}>
          <DialogTitle>Remove this artifact?</DialogTitle>
          <DialogContent>
            Are you sure you want to remove <i>{(this.state.artifact || {}).name}</i>?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this._removeDialog(null)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={() => this._removeArtifact(this.state.artifact)}>
              Remove artifact
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
