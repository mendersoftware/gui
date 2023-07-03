// Copyright 2015 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';

import { CloudUpload } from '@mui/icons-material';
import { Button, Tab, Tabs } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';

import { setSnackbar } from '../../actions/appActions';
import { advanceOnboarding, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import { createArtifact, getReleases, selectRelease, setReleasesListState, uploadArtifact } from '../../actions/releaseActions';
import { SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDeviceTypes, getFeatures, getOnboardingState, getReleasesList, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import { useLocationParams } from '../../utils/liststatehook';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import ChipSelect from '../common/chipselect';
import EnterpriseNotification from '../common/enterpriseNotification';
import InfoHint from '../common/info-hint';
import Search from '../common/search';
import AddArtifactDialog from './dialogs/addartifact';
import ReleaseDetails from './releasedetails';
import ReleasesList from './releaseslist';

const refreshArtifactsLength = 60000;

const DeltaProgressPlaceholder = ({ tenantCapabilities: { canDelta } }) => (
  <div className="dashboard-placeholder" style={{ display: 'grid', placeContent: 'center' }}>
    There is no automatic delta artifacts generation running.
    <EnterpriseNotification isEnterprise={canDelta} benefit="automatic artifact generation to reduce bandwidth consumption during deployments" />
  </div>
);

const tabs = [
  { key: 'releases', title: 'Releases', component: ReleasesList },
  { key: 'delta', title: 'Delta Artifacts generation', component: DeltaProgressPlaceholder }
];

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

const Header = ({ canUpload, existingTags = [], features, hasReleases, releasesListState, setReleasesListState, onUploadClick, uploadButtonRef }) => {
  const { hasReleaseTags } = features;
  const { selectedTags = [], searchTerm, searchTotal, tab = tabs[0].key, total } = releasesListState;
  const { classes } = useStyles();

  const searchUpdated = searchTerm => setReleasesListState({ searchTerm });

  const onTabChanged = (e, tab) => setReleasesListState({ tab });

  const onTagSelectionChanged = ({ selection }) => setReleasesListState({ selectedTags: selection });

  return (
    <div>
      <div className="flexbox space-between">
        <Tabs className={classes.tabContainer} value={tab} onChange={onTabChanged} textColor="primary">
          {tabs.map(({ key, title }) => (
            <Tab key={key} label={title} value={key} />
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
      {hasReleases && tab === tabs[0].key && (
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

export const Releases = () => {
  const demoArtifactLink = useSelector(state => state.app.demoArtifactLink);
  const deviceTypes = useSelector(getDeviceTypes);
  const features = useSelector(getFeatures);
  const hasReleases = useSelector(
    state => !!(Object.keys(state.releases.byId).length || state.releases.releasesList.total || state.releases.releasesList.searchTotal)
  );
  const onboardingState = useSelector(getOnboardingState);
  const { artifactIncluded } = onboardingState;
  const pastCount = useSelector(state => state.deployments.byStatus.finished.total);
  const releases = useSelector(getReleasesList);
  const releasesListState = useSelector(state => state.releases.releasesList);
  const releaseTags = useSelector(state => state.releases.releaseTags);
  const selectedRelease = useSelector(state => state.releases.byId[state.releases.selectedRelease]) ?? {};
  const tenantCapabilities = useSelector(getTenantCapabilities);
  const uploading = useSelector(state => state.app.uploading);
  const userCapabilities = useSelector(getUserCapabilities);
  const { canUploadReleases } = userCapabilities;
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState();
  const [showAddArtifactDialog, setShowAddArtifactDialog] = useState(false);
  const dropzoneRef = useRef();
  const uploadButtonRef = useRef();
  const artifactTimer = useRef();
  const [locationParams, setLocationParams] = useLocationParams('releases', { defaults: { direction: SORTING_OPTIONS.desc, key: 'modified' } });
  const { searchTerm, sort = {}, page, perPage, tab = tabs[0].key, selectedTags } = releasesListState;
  const debouncedSearchTerm = useDebounce(searchTerm, TIMEOUTS.debounceDefault);
  const { classes } = useStyles();

  useEffect(() => {
    if (!artifactTimer.current) {
      return;
    }
    setLocationParams({ pageState: { ...releasesListState, selectedRelease: selectedRelease.Name } });
  }, [debouncedSearchTerm, JSON.stringify(sort), page, perPage, selectedRelease.Name, tab, JSON.stringify(selectedTags)]);

  useEffect(() => {
    dispatch(setReleasesListState({ selectedTags: locationParams.tags }));
    if (locationParams.selectedRelease) {
      dispatch(selectRelease(locationParams.selectedRelease));
    }
  }, [JSON.stringify(locationParams.tags), locationParams.selectedRelease]);

  useEffect(() => {
    if (!onboardingState.progress || onboardingState.complete) {
      return;
    }
    if (releases.length === 1) {
      dispatch(advanceOnboarding(onboardingSteps.UPLOAD_PREPARED_ARTIFACT_TIP));
    }
    if (selectedRelease.Name) {
      dispatch(advanceOnboarding(onboardingSteps.ARTIFACT_INCLUDED_ONBOARDING));
    }
  }, [onboardingState.complete, onboardingState.progress, releases.length, selectedRelease.Name]);

  useEffect(() => {
    const { selectedRelease, tags, ...remainder } = locationParams;
    if (selectedRelease) {
      dispatch(selectRelease(selectedRelease));
    }
    dispatch(setReleasesListState({ ...remainder, selectedTags: tags }));
    clearInterval(artifactTimer.current);
    artifactTimer.current = setInterval(() => dispatch(getReleases()), refreshArtifactsLength);
    return () => {
      clearInterval(artifactTimer.current);
    };
  }, []);

  const onUploadClick = () => {
    if (releases.length) {
      dispatch(advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP));
    }
    setShowAddArtifactDialog(true);
  };

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      onFileUploadClick(acceptedFiles[0]);
    }
    if (rejectedFiles.length) {
      dispatch(setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File should be of type .mender`, null));
    }
  };

  const onFileUploadClick = selectedFile => {
    setSelectedFile(selectedFile);
    setShowAddArtifactDialog(true);
  };

  let uploadArtifactOnboardingComponent = null;
  if (!onboardingState.complete && uploadButtonRef.current) {
    const anchor = {
      anchor: {
        left: uploadButtonRef.current.offsetLeft - 15,
        top: uploadButtonRef.current.offsetTop + uploadButtonRef.current.offsetHeight / 2
      },
      place: 'left'
    };
    uploadArtifactOnboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_PREPARED_ARTIFACT_TIP,
      { ...onboardingState, demoArtifactLink },
      anchor
    );
    uploadArtifactOnboardingComponent = getOnboardingComponentFor(
      onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP,
      { ...onboardingState, setShowCreateArtifactDialog: state => dispatch(setShowCreateArtifactDialog(state)) },
      anchor,
      uploadArtifactOnboardingComponent
    );
  }

  const ContentComponent = useMemo(() => tabs.find(({ key }) => key === tab).component, [tab]);
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
          setReleasesListState={state => dispatch(setReleasesListState(state))}
        />
        {hasReleases ? (
          <ContentComponent
            artifactIncluded={artifactIncluded}
            features={features}
            onboardingState={onboardingState}
            onSelect={id => dispatch(selectRelease(id))}
            releases={releases}
            releasesListState={releasesListState}
            setReleasesListState={state => dispatch(setReleasesListState(state))}
            tenantCapabilities={tenantCapabilities}
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
      <ReleaseDetails />
      {!showAddArtifactDialog && uploadArtifactOnboardingComponent}
      {showAddArtifactDialog && (
        <AddArtifactDialog
          advanceOnboarding={step => dispatch(advanceOnboarding(step))}
          createArtifact={(meta, file) => dispatch(createArtifact(meta, file))}
          deviceTypes={deviceTypes}
          onboardingState={onboardingState}
          pastCount={pastCount}
          releases={releases}
          setSnackbar={(...args) => dispatch(setSnackbar(...args))}
          uploadArtifact={(meta, file) => dispatch(uploadArtifact(meta, file))}
          onCancel={() => setShowAddArtifactDialog(false)}
          onUploadStarted={() => setShowAddArtifactDialog(false)}
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
};

export default Releases;
