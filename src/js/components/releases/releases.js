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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CloudUpload } from '@mui/icons-material';
import { Button, Tab, Tabs } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';

import { getReleases, selectRelease, setReleasesListState } from '../../actions/releaseActions';
import { BENEFITS, SORTING_OPTIONS, TIMEOUTS } from '../../constants/appConstants';
import { getFeatures, getIsEnterprise, getReleasesList, getUserCapabilities } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import { useLocationParams } from '../../utils/liststatehook';
import ChipSelect from '../common/chipselect';
import EnterpriseNotification, { DefaultUpgradeNotification } from '../common/enterpriseNotification';
import Search from '../common/search';
import { HELPTOOLTIPS, MenderHelpTooltip } from '../helptips/helptooltips';
import AddArtifactDialog from './dialogs/addartifact';
import ReleaseDetails from './releasedetails';
import ReleasesList from './releaseslist';

const refreshArtifactsLength = 60000;

const DeltaProgress = () => {
  const isEnterprise = useSelector(getIsEnterprise);
  return (
    <div className="dashboard-placeholder" style={{ display: 'grid', placeContent: 'center' }}>
      {isEnterprise ? 'There is no automatic delta artifacts generation running.' : <DefaultUpgradeNotification />}
    </div>
  );
};

const DeltaTitle = () => (
  <div className="flexbox center-aligned">
    <div>Delta Artifacts generation</div>
    <EnterpriseNotification className="margin-left-small" id={BENEFITS.deltaGeneration.id} />
  </div>
);

const tabs = [
  { key: 'releases', Title: () => 'Releases', component: ReleasesList },
  { key: 'delta', Title: DeltaTitle, component: DeltaProgress }
];

const useStyles = makeStyles()(theme => ({
  filters: { maxWidth: 400, alignItems: 'end', columnGap: 50 },
  searchNote: { minHeight: '1.8rem' },
  tabContainer: { alignSelf: 'flex-start' },
  uploadButton: { minWidth: 164, marginRight: theme.spacing(2) }
}));

const Header = ({ canUpload, existingTags = [], features, hasReleases, releasesListState, setReleasesListState, onUploadClick }) => {
  const { hasReleaseTags } = features;
  const { selectedTags = [], searchTerm, searchTotal, tab = tabs[0].key, total } = releasesListState;
  const { classes } = useStyles();

  const searchUpdated = useCallback(searchTerm => setReleasesListState({ searchTerm }), [setReleasesListState]);

  const onTabChanged = (e, tab) => setReleasesListState({ tab });

  const onTagSelectionChanged = ({ selection }) => setReleasesListState({ selectedTags: selection });

  return (
    <div>
      <div className="flexbox space-between center-aligned">
        <Tabs className={classes.tabContainer} value={tab} onChange={onTabChanged} textColor="primary">
          {tabs.map(({ key, Title }) => (
            <Tab key={key} label={<Title />} value={key} />
          ))}
        </Tabs>
        {canUpload && (
          <div className="flexbox center-aligned">
            <Button color="secondary" className={classes.uploadButton} onClick={onUploadClick} startIcon={<CloudUpload fontSize="small" />} variant="contained">
              Upload
            </Button>
            <MenderHelpTooltip id={HELPTOOLTIPS.artifactUpload.id} style={{ marginTop: 8 }} />
          </div>
        )}
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
  const features = useSelector(getFeatures);
  const hasReleases = useSelector(
    state => !!(Object.keys(state.releases.byId).length || state.releases.releasesList.total || state.releases.releasesList.searchTotal)
  );
  const releases = useSelector(getReleasesList);
  const releasesListState = useSelector(state => state.releases.releasesList);
  const releaseTags = useSelector(state => state.releases.releaseTags);
  const selectedRelease = useSelector(state => state.releases.byId[state.releases.selectedRelease]) ?? {};
  const userCapabilities = useSelector(getUserCapabilities);
  const { canUploadReleases } = userCapabilities;
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState();
  const [showAddArtifactDialog, setShowAddArtifactDialog] = useState(false);
  const artifactTimer = useRef();
  const [locationParams, setLocationParams] = useLocationParams('releases', { defaults: { direction: SORTING_OPTIONS.desc, key: 'modified' } });
  const { searchTerm, sort = {}, page, perPage, tab = tabs[0].key, selectedTags } = releasesListState;
  const debouncedSearchTerm = useDebounce(searchTerm, TIMEOUTS.debounceDefault);

  useEffect(() => {
    if (!artifactTimer.current) {
      return;
    }
    setLocationParams({ pageState: { ...releasesListState, selectedRelease: selectedRelease.Name } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, JSON.stringify(sort), page, perPage, selectedRelease.Name, setLocationParams, tab, JSON.stringify(selectedTags)]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(locationParams)]);

  const onUploadClick = () => setShowAddArtifactDialog(true);

  const onFileUploadClick = selectedFile => {
    setSelectedFile(selectedFile);
    setShowAddArtifactDialog(true);
  };

  const onHideAddArtifactDialog = () => setShowAddArtifactDialog(false);

  const onSetReleasesListState = useCallback(state => dispatch(setReleasesListState(state)), [dispatch]);

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
          setReleasesListState={onSetReleasesListState}
        />
        <ContentComponent onFileUploadClick={onFileUploadClick} />
      </div>
      <ReleaseDetails />
      {showAddArtifactDialog && (
        <AddArtifactDialog releases={releases} onCancel={onHideAddArtifactDialog} onUploadStarted={onHideAddArtifactDialog} selectedFile={selectedFile} />
      )}
    </div>
  );
};

export default Releases;
