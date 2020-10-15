import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import ReactTooltip from 'react-tooltip';

// material ui
import { Button, Tooltip, Typography } from '@material-ui/core';
import { Help as HelpIcon, Sort as SortIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { editArtifact, uploadArtifact, selectArtifact, selectRelease } from '../../actions/releaseActions';
import { customSort } from '../../helpers';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import { ExpandArtifact } from '../helptips/helptooltips';
import Loader from '../common/loader';
import ReleaseRepositoryItem from './releaserepositoryitem';

const columnHeaders = [
  { title: 'Device type compatibility', name: 'device_types', sortable: false },
  { title: 'Last modified', name: 'modified', sortable: true },
  { title: 'Type', name: 'type', sortable: false },
  { title: 'Size', name: 'size', sortable: true }
];

export class ReleaseRepository extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      popupLabel: 'Upload a new artifact',
      sortCol: 'modified',
      sortDown: true,
      tmpFile: null,
      upload: false,
      wasSelectedRecently: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.release && this.props.release && prevProps.release.Name !== this.props.release.Name) {
      const self = this;
      self.setState({ wasSelectedRecently: true }, () => setTimeout(() => self.setState({ wasSelectedRecently: false }), 200));
    }
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length) {
      this.props.onUpload(acceptedFiles[0]);
    }
    if (rejectedFiles.length) {
      this.props.setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File should be of type .mender`, null);
    }
  }

  _onRowSelection(artifact) {
    if (!artifact || !this.props.selectedArtifact || this.props.selectedArtifact.id !== artifact.id) {
      this.props.selectArtifact(artifact);
    } else {
      this.props.selectArtifact();
    }
    if (!this.props.onboardingState.complete) {
      this.props.advanceOnboarding('artifact-included-onboarding');
    }
  }

  _editArtifactData(id, description) {
    const self = this;
    return self.props.editArtifact(id, { description }).then(() => self.props.refreshArtifacts());
  }

  onCreateDeploymentFrom(release) {
    if (!this.props.onboardingState.complete) {
      this.props.advanceOnboarding('scheduling-artifact-selection');
      if (this.props.pastDeploymentsCount === 1) {
        this.props.advanceOnboarding('artifact-modified-onboarding');
      }
    }
    this.props.selectRelease(release);
  }

  _sortColumn(col) {
    if (!col.sortable) {
      return;
    }
    // sort table
    this.setState({ sortDown: !this.state.sortDown, sortCol: col.name });
  }

  render() {
    const self = this;
    const { artifactIncluded, demoArtifactLink, loading, onboardingState, onUpload, release, releases, selectedArtifact, showHelptips, uploading } = self.props;
    const { sortCol, sortDown, wasSelectedRecently } = self.state;
    const artifacts = release ? release.Artifacts : [];
    const items = artifacts.sort(customSort(sortDown, sortCol)).map((pkg, index) => {
      const expanded = !!(selectedArtifact && selectedArtifact.id === pkg.id);
      return (
        <ReleaseRepositoryItem
          key={`repository-item-${index}`}
          artifact={pkg}
          expanded={expanded}
          index={index}
          onEdit={(id, description) => self._editArtifactData(id, description)}
          onRowSelection={() => self._onRowSelection(pkg)}
          // this will be run after expansion + collapse and both need some time to fully settle
          // otherwise the measurements are off
          onExpanded={() => setTimeout(() => self.setState({}), 500)}
          release={release}
          ref={ref => (this.repoItemAnchor = ref)}
        />
      );
    });

    const dropzoneClass = uploading ? 'dropzone disabled muted' : 'dropzone';

    // We need the ref to the <a> element that refers to the deployments tab, in order to align
    // the helptip with the button - unfortunately this is not forwarded through react-router or mui
    // thus, use the following component as a workaround:
    const ForwardingLink = React.forwardRef((props, ref) => <Link {...props} innerRef={ref} />);
    ForwardingLink.displayName = 'ForwardingLink';

    let onboardingComponent = null;
    let uploadArtifactOnboardingComponent = null;
    if (this.repoItemAnchor && this.creationRef) {
      const element = this.repoItemAnchor.itemRef;
      const anchor = { left: element.offsetLeft + element.offsetWidth / 3, top: element.offsetTop + element.offsetHeight };
      const artifactIncludedAnchor = {
        left: this.creationRef.offsetLeft + this.creationRef.offsetWidth,
        top: this.creationRef.offsetTop + this.creationRef.offsetHeight / 2
      };
      const artifactUploadedAnchor = {
        left: this.creationRef.offsetLeft + this.creationRef.offsetWidth / 2,
        top: this.creationRef.offsetTop - this.creationRef.offsetHeight / 2
      };

      onboardingComponent = getOnboardingComponentFor('artifact-included-onboarding', { ...onboardingState, artifactIncluded }, { anchor });
      onboardingComponent = getOnboardingComponentFor(
        'artifact-included-deploy-onboarding',
        onboardingState,
        { place: 'right', anchor: artifactIncludedAnchor },
        onboardingComponent
      );
      onboardingComponent = getOnboardingComponentFor('deployments-past-completed', onboardingState, { anchor }, onboardingComponent);
      onboardingComponent = getOnboardingComponentFor(
        'artifact-modified-onboarding',
        onboardingState,
        { anchor: artifactUploadedAnchor, place: 'bottom' },
        onboardingComponent
      );
    }
    if (this.dropzoneRef) {
      const dropzoneAnchor = { left: this.dropzoneRef.offsetLeft, top: this.dropzoneRef.offsetTop + this.dropzoneRef.offsetHeight };
      uploadArtifactOnboardingComponent = getOnboardingComponentFor(
        'upload-prepared-artifact-tip',
        { ...onboardingState, demoArtifactLink },
        { anchor: dropzoneAnchor, place: 'left' }
      );
    }

    return loading || wasSelectedRecently ? (
      <div className="flexbox centered" style={{ width: '100%', height: '50%' }}>
        <Loader show={true} />
      </div>
    ) : (
      <div className="relative release-repo margin-left" style={{ width: '100%' }}>
        <div className="muted margin-bottom">
          <Typography variant="body1" style={{ marginBottom: 10 }}>
            Release:
          </Typography>
          <Typography variant="body2">{release ? release.Name : 'No release selected'}</Typography>
        </div>
        {!!release && (
          <Typography variant="body1" style={{ fontWeight: 'bold' }}>
            Artifacts in this Release:
          </Typography>
        )}

        {uploadArtifactOnboardingComponent ? uploadArtifactOnboardingComponent : null}
        <Loader show={loading} />

        <div style={{ position: 'relative', marginTop: '10px' }}>
          {items.length ? (
            <div>
              <div className="release-repo-item repo-item repo-header">
                {columnHeaders.map(item => (
                  <Tooltip key={item.name} className="columnHeader" title={item.title} placement="top-start" onClick={() => self._sortColumn(item)}>
                    <div>
                      {item.title}
                      {item.sortable ? (
                        <SortIcon className={`sortIcon ${self.state.sortCol === item.name ? 'selected' : ''} ${self.state.sortDown.toString()}`} />
                      ) : null}
                    </div>
                  </Tooltip>
                ))}
                <div style={{ width: 48 }} />
              </div>
              {items}
              <Button
                color="primary"
                variant="contained"
                buttonRef={ref => (this.creationRef = ref)}
                component={ForwardingLink}
                to={`/deployments?open=true&release=${release.Name}`}
                style={{ marginLeft: 20 }}
                onClick={() => self.onCreateDeploymentFrom(release)}
              >
                Create deployment with this release
              </Button>
            </div>
          ) : null}
          {!!onboardingComponent && onboardingComponent}

          {showHelptips && items.length ? (
            <div>
              <div id="onboard-10" className="tooltip help" data-tip data-for="artifact-expand-tip" data-event="click focus">
                <HelpIcon />
              </div>
              <ReactTooltip id="artifact-expand-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <ExpandArtifact />
              </ReactTooltip>
            </div>
          ) : null}

          {items.length || loading ? null : (
            <div className="dashboard-placeholder fadeIn" style={{ fontSize: '16px', margin: '8vh auto' }}>
              {releases.length > 0 ? (
                <p>Select a Release on the left to view its Artifact details</p>
              ) : (
                <Dropzone
                  activeClassName="active"
                  disabled={uploading}
                  multiple={false}
                  noClick={true}
                  onDrop={(accepted, rejected) => self.onDrop(accepted, rejected)}
                  rejectClassName="active"
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps({ className: dropzoneClass })} onClick={() => onUpload()} ref={ref => (self.dropzoneRef = ref)}>
                      <input {...getInputProps()} disabled={uploading} />
                      <p>
                        There are no Releases yet. <a>Upload an Artifact</a> to create a new Release
                      </p>
                    </div>
                  )}
                </Dropzone>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const actionCreators = { advanceOnboarding, editArtifact, selectArtifact, setSnackbar, selectRelease, uploadArtifact };

const mapStateToProps = state => {
  return {
    artifactIncluded: state.onboarding.artifactIncluded,
    demoArtifactLink: state.app.demoArtifactLink,
    onboardingState: getOnboardingState(state),
    pastDeploymentsCount: state.deployments.byStatus.finished.total,
    release: state.releases.selectedRelease ? state.releases.byId[state.releases.selectedRelease] : null,
    releases: Object.values(state.releases.byId),
    selectedArtifact: state.releases.selectedArtifact,
    showHelptips: state.users.showHelptips,
    uploading: state.releases.uploading
  };
};

export default connect(mapStateToProps, actionCreators)(ReleaseRepository);
