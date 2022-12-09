import React, { useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';

// material ui
import { Sort as SortIcon } from '@mui/icons-material';
import { Button, Tooltip, Typography } from '@mui/material';

import { setSnackbar } from '../../actions/appActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { editArtifact, removeArtifact, selectArtifact, selectRelease, uploadArtifact } from '../../actions/releaseActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { customSort, toggle } from '../../helpers';
import { getOnboardingState, getUserCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import ForwardingLink from '../common/forwardlink';
import Loader from '../common/loader';
import { ExpandArtifact } from '../helptips/helptooltips';
import RemoveArtifactDialog from './dialogs/removeartifact';
import ReleaseRepositoryItem from './releaserepositoryitem';

const columnHeaders = [
  { title: 'Device type compatibility', name: 'device_types', sortable: false },
  { title: 'Last modified', name: 'modified', sortable: true },
  { title: 'Type', name: 'type', sortable: false },
  { title: 'Size', name: 'size', sortable: true }
];

export const ReleaseRepository = ({
  advanceOnboarding,
  artifactIncluded,
  demoArtifactLink,
  editArtifact,
  loading,
  onboardingState,
  onUpload,
  pastDeploymentsCount,
  refreshArtifacts,
  release,
  releases,
  removeArtifact,
  selectArtifact,
  selectedArtifact,
  selectRelease,
  setSnackbar,
  showHelptips,
  uploading,
  userCapabilities
}) => {
  const [sortCol, setSortCol] = useState('modified');
  const [sortDown, setSortDown] = useState(true);
  const [wasSelectedRecently, setWasSelectedRecently] = useState(false);
  const [showRemoveDialog, setShowRemoveArtifactDialog] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });
  // eslint-disable-next-line no-unused-vars
  const windowSize = useWindowSize();

  const creationRef = useRef();
  const dropzoneRef = useRef();
  let repoItemAnchor = useRef();

  const { canDeploy, canUploadReleases } = userCapabilities;

  useEffect(() => {
    setWasSelectedRecently(true);
  }, [release.Name]);

  useEffect(() => {
    if (!onboardingState.complete && releases.length === 1) {
      advanceOnboarding(onboardingSteps.UPLOAD_PREPARED_ARTIFACT_TIP);
    }
  }, [releases.length]);

  useEffect(() => {
    if (wasSelectedRecently) {
      setTimeout(() => setWasSelectedRecently(false), TIMEOUTS.debounceShort);
    }
  }, [wasSelectedRecently]);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      onUpload(acceptedFiles[0]);
    }
    if (rejectedFiles.length) {
      setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File should be of type .mender`, null);
    }
  };

  const onRowSelection = artifact => {
    if (!artifact || !selectedArtifact || selectedArtifact.id !== artifact.id) {
      selectArtifact(artifact);
    } else {
      selectArtifact();
    }
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.ARTIFACT_INCLUDED_ONBOARDING);
    }
  };

  const editArtifactData = (id, description) => editArtifact(id, { description }).then(refreshArtifacts);

  const onCreateDeploymentFrom = release => {
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING);
      if (pastDeploymentsCount === 1) {
        advanceOnboarding(onboardingSteps.ARTIFACT_MODIFIED_ONBOARDING);
      }
    }
    selectRelease(release);
  };

  const sortColumn = col => {
    if (!col.sortable) {
      return;
    }
    // sort table
    setSortDown(toggle);
    setSortCol(col);
  };

  const onExpansion = () => setTimeout(() => setSize({ height: window.innerHeight, width: window.innerWidth }), TIMEOUTS.halfASecond);

  const onRemoveArtifact = artifact => removeArtifact(artifact.id).finally(() => setShowRemoveArtifactDialog(false));

  const artifacts = release.Artifacts ?? [];
  const items = artifacts.sort(customSort(sortDown, sortCol)).map((pkg, index) => {
    const expanded = !!(selectedArtifact && selectedArtifact.id === pkg.id);
    return (
      <ReleaseRepositoryItem
        key={`repository-item-${index}`}
        artifact={pkg}
        expanded={expanded}
        index={index}
        itemRef={repoItemAnchor}
        onEdit={editArtifactData}
        onRowSelection={() => onRowSelection(pkg)}
        // this will be run after expansion + collapse and both need some time to fully settle
        // otherwise the measurements are off
        onExpanded={onExpansion}
        showRemoveArtifactDialog={setShowRemoveArtifactDialog}
      />
    );
  });

  const dropzoneClass = uploading ? 'dropzone disabled muted' : 'dropzone';

  let onboardingComponent = null;
  let uploadArtifactOnboardingComponent = null;
  if (repoItemAnchor.current && creationRef.current) {
    const element = repoItemAnchor.current;
    const anchor = { left: element.offsetLeft + element.offsetWidth / 3, top: element.offsetTop + element.offsetHeight };
    const artifactIncludedAnchor = {
      left: creationRef.current.offsetLeft + creationRef.current.offsetWidth,
      top: creationRef.current.offsetTop + creationRef.current.offsetHeight / 2
    };
    const artifactUploadedAnchor = {
      left: creationRef.current.offsetLeft + creationRef.current.offsetWidth / 2,
      top: creationRef.current.offsetTop - creationRef.current.offsetHeight / 2
    };

    onboardingComponent = getOnboardingComponentFor(onboardingSteps.ARTIFACT_INCLUDED_ONBOARDING, { ...onboardingState, artifactIncluded }, { anchor });
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING,
      onboardingState,
      { place: 'right', anchor: artifactIncludedAnchor },
      onboardingComponent
    );
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor }, onboardingComponent);
    onboardingComponent = getOnboardingComponentFor(
      onboardingSteps.ARTIFACT_MODIFIED_ONBOARDING,
      onboardingState,
      { anchor: artifactUploadedAnchor, place: 'bottom' },
      onboardingComponent
    );
  }
  if (dropzoneRef.current && !releases.length) {
    const dropzoneAnchor = { left: 30, top: dropzoneRef.current.offsetTop + dropzoneRef.current.offsetHeight };
    uploadArtifactOnboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_PREPARED_ARTIFACT_TIP,
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
        <Typography variant="body2">{release.Name || 'No release selected'}</Typography>
      </div>
      {!!release.Artifacts && (
        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
          Artifacts in this Release:
        </Typography>
      )}

      {uploadArtifactOnboardingComponent ? uploadArtifactOnboardingComponent : null}
      <div className="relative margin-top margin-right-small">
        {items.length ? (
          <div>
            <div className="release-repo-item repo-item repo-header">
              {columnHeaders.map(item => (
                <Tooltip key={item.name} className="columnHeader" title={item.title} placement="top-start" onClick={() => sortColumn(item)}>
                  <div>
                    {item.title}
                    {item.sortable ? <SortIcon className={`sortIcon ${sortCol === item.name ? 'selected' : ''} ${sortDown.toString()}`} /> : null}
                  </div>
                </Tooltip>
              ))}
              <div style={{ width: 48 }} />
            </div>
            {items}
            {canDeploy && (
              <Button
                color="primary"
                variant="contained"
                ref={creationRef}
                component={ForwardingLink}
                to={`${DEPLOYMENT_ROUTES.active.route}?open=true&release=${encodeURIComponent(release.Name)}`}
                style={{ marginLeft: 20 }}
                onClick={() => onCreateDeploymentFrom(release)}
              >
                Create deployment with this release
              </Button>
            )}
          </div>
        ) : null}
        {!!onboardingComponent && onboardingComponent}

        {showHelptips && items.length ? <ExpandArtifact /> : null}

        {!items.length && (
          <div className="dashboard-placeholder fadeIn" style={{ fontSize: '16px', margin: '8vh auto' }} ref={dropzoneRef}>
            {releases.length > 0 ? (
              <p>Select a Release on the left to view its Artifact details</p>
            ) : (
              <Dropzone activeClassName="active" disabled={uploading} multiple={false} noClick={true} onDrop={onDrop} rejectClassName="active">
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps({ className: dropzoneClass })} onClick={() => onUpload()}>
                    <input {...getInputProps()} disabled={uploading} />
                    <p>
                      There are no Releases yet.{' '}
                      {canUploadReleases && (
                        <>
                          <a>Upload an Artifact</a> to create a new Release
                        </>
                      )}
                    </p>
                  </div>
                )}
              </Dropzone>
            )}
          </div>
        )}
        {showRemoveDialog && (
          <RemoveArtifactDialog
            artifact={selectedArtifact.name}
            onCancel={() => setShowRemoveArtifactDialog(false)}
            onRemove={() => onRemoveArtifact(selectedArtifact)}
          />
        )}
      </div>
    </div>
  );
};

const actionCreators = { advanceOnboarding, editArtifact, removeArtifact, selectArtifact, setSnackbar, selectRelease, uploadArtifact };

const mapStateToProps = state => {
  return {
    artifactIncluded: state.onboarding.artifactIncluded,
    demoArtifactLink: state.app.demoArtifactLink,
    onboardingState: getOnboardingState(state),
    pastDeploymentsCount: state.deployments.byStatus.finished.total,
    release: state.releases.byId[state.releases.selectedRelease] ?? {},
    releases: Object.values(state.releases.byId),
    selectedArtifact: state.releases.selectedArtifact,
    showHelptips: state.users.showHelptips,
    uploading: state.app.uploading,
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(ReleaseRepository);
