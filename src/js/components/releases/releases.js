import React, { useEffect, useMemo, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';

import { CloudUpload } from '@mui/icons-material';
import { Button, Tab, Tabs } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';

import { setSnackbar } from '../../actions/appActions';
import { advanceOnboarding, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import { createArtifact, getReleases, removeArtifact, selectRelease, setReleasesListState, uploadArtifact } from '../../actions/releaseActions';
import { SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDeviceTypes, getFeatures, getOnboardingState, getReleasesList, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import { useLocationParams } from '../../utils/liststatehook';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import ChipSelect from '../common/chipselect';
import InfoHint from '../common/info-hint';
import Search from '../common/search';
import AddArtifactDialog from './dialogs/addartifact';
import SelectedRelease from './releasedetails';
import ReleasesList from './releaseslist';

const refreshArtifactsLength = 60000;

const tabs = [
  { key: 'releases', title: 'Releases', component: ReleasesList, isApplicable: () => true },
  {
    key: 'delta',
    title: 'Delta Artifacts generation',
    component: 'div',
    isApplicable: ({ features: { hasDeltaProgress }, tenantCapabilities: { canDelta } }) => hasDeltaProgress && canDelta
  }
];

const UploadArtifactOnboardingComponent = ({ dropzoneRef, onboardingState, demoArtifactLink, releases }) => {
  if (!dropzoneRef.current || releases.length) {
    return null;
  }
  const dropzoneAnchor = { left: 30, top: dropzoneRef.current.offsetTop + dropzoneRef.current.offsetHeight };
  return getOnboardingComponentFor(
    onboardingSteps.UPLOAD_PREPARED_ARTIFACT_TIP,
    { ...onboardingState, demoArtifactLink },
    { anchor: dropzoneAnchor, place: 'left' }
  );
};

const useStyles = makeStyles()(theme => ({
  empty: { margin: '8vh auto' },
  filters: { maxWidth: 400, alignItems: 'end', columnGap: 50 },
  searchNote: { minHeight: '1.8rem' },
  tabContainer: { alignSelf: 'flex-start' },
  uploadButton: { marginTop: theme.spacing(1.5), minWidth: 164 }
}));

const EmptyState = ({ canUpload, className = '', dropzoneRef, uploading, onDrop, onUpload }) => (
  <div className={`dashboard-placeholder fadeIn ${className}`} ref={dropzoneRef}>
    <Dropzone activeClassName="active" disabled={uploading} multiple={false} noClick={true} onDrop={onDrop} rejectClassName="active">
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps({ className: uploading ? 'dropzone disabled muted' : 'dropzone' })} onClick={() => onUpload()}>
          <input {...getInputProps()} disabled={uploading} />
          <p>
            There are no Releases yet.{' '}
            {canUpload && (
              <>
                <a>Upload an Artifact</a> to create a new Release
              </>
            )}
          </p>
        </div>
      )}
    </Dropzone>
  </div>
);

const Header = ({
  canUpload,
  existingTags = [],
  features,
  hasReleases,
  releasesListState,
  setReleasesListState,
  onUploadClick,
  tenantCapabilities,
  uploadButtonRef
}) => {
  const { hasReleaseTags } = features;
  const { selectedTags = [], searchTerm, searchTotal, tab = tabs[0].key, total } = releasesListState;
  const { classes } = useStyles();

  const searchUpdated = searchTerm => setReleasesListState({ searchTerm });

  const onTabChanged = (e, tab) => setReleasesListState({ tab });

  const onTagSelectionChanged = ({ selection }) => setReleasesListState({ selectedTags: selection });

  const availableTabs = useMemo(
    () =>
      tabs.reduce((accu, tab) => {
        if (tab.isApplicable({ features, tenantCapabilities })) {
          accu.push(tab);
        } else {
          accu.push({ ...tab, disabled: true });
        }
        return accu;
      }, []),
    [JSON.stringify(tenantCapabilities)]
  );

  return (
    <div>
      <div className="flexbox space-between">
        <Tabs className={classes.tabContainer} value={tab} onChange={onTabChanged} textColor="primary">
          {availableTabs.map(({ disabled = false, key, title }) => (
            <Tab key={key} label={title} value={key} disabled={disabled} />
          ))}
        </Tabs>
        <div>
          {canUpload && (
            <>
              <Button
                ref={uploadButtonRef}
                color="secondary"
                className={classes.uploadButton}
                onClick={onUploadClick}
                startIcon={<CloudUpload fontSize="small" />}
                variant="contained"
              >
                Upload
              </Button>
              <InfoHint content="Upload an Artifact to an existing or new Release" />
            </>
          )}
        </div>
      </div>
      {hasReleases && (
        <div className={`two-columns ${classes.filters}`}>
          <Search onSearch={searchUpdated} searchTerm={searchTerm} placeholder="Search releases by name" />
          {hasReleaseTags && (
            <ChipSelect
              id="release-tag-selection"
              label="Filter by tag"
              onChange={onTagSelectionChanged}
              placeholder="Filter by tag"
              selection={selectedTags}
              options={existingTags}
            />
          )}
        </div>
      )}
      <p className={`muted ${classes.searchNote}`}>{searchTerm && searchTotal !== total ? `Filtered from ${total} ${pluralize('Release', total)}` : ''}</p>
    </div>
  );
};

export const Releases = props => {
  const {
    demoArtifactLink,
    getReleases,
    onboardingState,
    features,
    hasReleases,
    releases,
    releasesListState,
    releaseTags,
    selectedRelease,
    selectRelease,
    setReleasesListState,
    setShowCreateArtifactDialog,
    tenantCapabilities,
    uploading,
    userCapabilities
  } = props;
  const { canUploadReleases } = userCapabilities;

  const [selectedFile, setSelectedFile] = useState();
  const [showAddArtifactDialog, setShowAddArtifactDialog] = useState(false);
  const dropzoneRef = useRef();
  const uploadButtonRef = useRef();
  const artifactTimer = useRef();
  const [locationParams, setLocationParams] = useLocationParams('releases', { defaults: { direction: SORTING_OPTIONS.desc, key: 'modified' } });
  const { searchTerm, sort = {}, page, perPage, tab, selectedTags } = releasesListState;
  const debouncedSearchTerm = useDebounce(searchTerm, TIMEOUTS.debounceDefault);
  const { classes } = useStyles();

  useEffect(() => {
    if (!artifactTimer.current) {
      return;
    }
    setLocationParams({ pageState: { ...releasesListState, selectedRelease: selectedRelease.Name } });
  }, [debouncedSearchTerm, JSON.stringify(sort), page, perPage, selectedRelease.Name, tab, JSON.stringify(selectedTags)]);

  useEffect(() => {
    setReleasesListState({ selectedTags: locationParams.tags });
    if (locationParams.selectedRelease) {
      selectRelease(locationParams.selectedRelease);
    }
  }, [JSON.stringify(locationParams.tags), locationParams.selectedRelease]);

  useEffect(() => {
    const { selectedRelease, tags, ...remainder } = locationParams;
    if (selectedRelease) {
      selectRelease(selectedRelease);
    }
    setReleasesListState({ ...remainder, selectedTags: tags });
    clearInterval(artifactTimer.current);
    artifactTimer.current = setInterval(getReleases, refreshArtifactsLength);
    return () => {
      clearInterval(artifactTimer.current);
    };
  }, []);

  const onUploadClick = () => {
    if (releases.length) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP);
    }
    setShowAddArtifactDialog(true);
  };

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      onFileUploadClick(acceptedFiles[0]);
    }
    if (rejectedFiles.length) {
      setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File should be of type .mender`, null);
    }
  };

  const onFileUploadClick = selectedFile => {
    setSelectedFile(selectedFile);
    setShowAddArtifactDialog(true);
  };

  const onUploadFinished = releaseName => getReleases().then(() => selectRelease(releaseName));

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

  return (
    <div className="margin">
      <div>
        <Header
          canUpload={canUploadReleases}
          existingTags={releaseTags}
          features={features}
          hasReleases={hasReleases}
          onUploadClick={onUploadClick}
          releasesListState={releasesListState}
          setReleasesListState={setReleasesListState}
          tenantCapabilities={tenantCapabilities}
        />
        {hasReleases ? (
          <ReleasesList
            features={features}
            onSelect={selectRelease}
            releases={releases}
            releasesListState={releasesListState}
            setReleasesListState={setReleasesListState}
          />
        ) : (
          <EmptyState
            canUpload={canUploadReleases}
            className={classes.empty}
            dropzoneRef={dropzoneRef}
            uploading={uploading}
            onDrop={onDrop}
            onUpload={onFileUploadClick}
          />
        )}
      </div>
      <SelectedRelease />
      <UploadArtifactOnboardingComponent dropzoneRef={dropzoneRef} onboardingState={onboardingState} demoArtifactLink={demoArtifactLink} releases={releases} />
      {!!uploadArtifactOnboardingComponent && !showAddArtifactDialog && uploadArtifactOnboardingComponent}
      {showAddArtifactDialog && (
        <AddArtifactDialog
          {...props}
          onCancel={() => setShowAddArtifactDialog(false)}
          onUploadStarted={() => setShowAddArtifactDialog(false)}
          onUploadFinished={onUploadFinished}
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
};

const actionCreators = {
  advanceOnboarding,
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
  return {
    deviceTypes: getDeviceTypes(state),
    features: getFeatures(state),
    hasReleases: !!(Object.keys(state.releases.byId).length || state.releases.releasesList.total || state.releases.releasesList.searchTotal),
    onboardingState: getOnboardingState(state),
    pastCount: state.deployments.byStatus.finished.total,
    demoArtifactLink: state.app.demoArtifactLink,
    releases: getReleasesList(state),
    releasesListState: state.releases.releasesList,
    releaseTags: state.releases.releaseTags,
    selectedRelease: state.releases.byId[state.releases.selectedRelease] ?? {},
    showRemoveDialog: state.releases.showRemoveDialog,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state),
    uploading: state.app.uploading
  };
};

export default connect(mapStateToProps, actionCreators)(Releases);
