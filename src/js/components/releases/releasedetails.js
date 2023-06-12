// Copyright 2019 Northern.tech AS
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
import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// material ui
import {
  Close as CloseIcon,
  Edit as EditIcon,
  HighlightOffOutlined as HighlightOffOutlinedIcon,
  Link as LinkIcon,
  Replay as ReplayIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { Button, Collapse, Divider, Drawer, IconButton, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip } from '@mui/material';
import { speedDialActionClasses } from '@mui/material/SpeedDialAction';
import { makeStyles } from 'tss-react/mui';

import copy from 'copy-to-clipboard';

import { setSnackbar } from '../../actions/appActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { removeArtifact, removeRelease, selectArtifact, selectRelease } from '../../actions/releaseActions';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { FileSize, customSort, formatTime, toggle } from '../../helpers';
import { getFeatures, getOnboardingState, getShowHelptips, getUserCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';
import ChipSelect from '../common/chipselect';
import { RelativeTime } from '../common/time';
import { ExpandArtifact } from '../helptips/helptooltips';
import Artifact from './artifact';
import RemoveArtifactDialog from './dialogs/removeartifact';

const DeviceTypeCompatibility = ({ artifact }) => {
  const compatible = artifact.artifact_depends ? artifact.artifact_depends.device_type.join(', ') : artifact.device_types_compatible.join(', ');
  return (
    <Tooltip title={compatible} placement="top-start">
      <div className="text-overflow">{compatible}</div>
    </Tooltip>
  );
};

export const columns = [
  {
    title: 'Device type compatibility',
    name: 'device_types',
    sortable: false,
    render: DeviceTypeCompatibility
  },
  {
    title: 'Type',
    name: 'type',
    sortable: false,
    render: ({ artifact }) => <div style={{ maxWidth: '100vw' }}>{artifact.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '')}</div>
  },
  { title: 'Size', name: 'size', sortable: true, render: ({ artifact }) => <FileSize fileSize={artifact.size} /> },
  { title: 'Last modified', name: 'modified', sortable: true, render: ({ artifact }) => <RelativeTime updateTime={formatTime(artifact.modified)} /> }
];

const defaultActions = [
  {
    action: ({ onCreateDeployment, selection }) => onCreateDeployment(selection),
    icon: <ReplayIcon />,
    isApplicable: ({ userCapabilities: { canDeploy } }) => canDeploy,
    key: 'deploy',
    title: 'Create a deployment for this release'
  },
  {
    action: ({ onDeleteRelease, selection }) => onDeleteRelease(selection),
    icon: <HighlightOffOutlinedIcon className="red" />,
    isApplicable: ({ userCapabilities: { canManageReleases } }) => canManageReleases,
    key: 'delete',
    title: 'Delete release'
  }
];

const useStyles = makeStyles()(theme => ({
  container: {
    display: 'flex',
    position: 'fixed',
    bottom: theme.spacing(6.5),
    right: theme.spacing(6.5),
    zIndex: 10,
    minWidth: 'max-content',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
    [`.${speedDialActionClasses.staticTooltipLabel}`]: {
      minWidth: 'max-content'
    }
  },
  fab: { margin: theme.spacing(2) },
  tagSelect: { maxWidth: 350 },
  label: {
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(4)
  }
}));

export const ReleaseQuickActions = ({ actionCallbacks, innerRef, selectedRelease, userCapabilities }) => {
  const [showActions, setShowActions] = useState(false);
  const { classes } = useStyles();

  const actions = useMemo(() => {
    return Object.values(defaultActions).reduce((accu, action) => {
      if (action.isApplicable({ userCapabilities })) {
        accu.push(action);
      }
      return accu;
    }, []);
  }, [JSON.stringify(userCapabilities)]);

  return (
    <div className={classes.container} ref={innerRef}>
      <div className={classes.label}>Release actions</div>
      <SpeedDial
        className={classes.fab}
        ariaLabel="device-actions"
        icon={<SpeedDialIcon />}
        onClose={() => setShowActions(false)}
        onOpen={setShowActions}
        open={Boolean(showActions)}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.key}
            aria-label={action.key}
            icon={action.icon}
            tooltipTitle={action.title}
            tooltipOpen
            onClick={() => action.action({ ...actionCallbacks, selection: selectedRelease })}
          />
        ))}
      </SpeedDial>
    </div>
  );
};

const OnboardingComponent = ({ creationRef, drawerRef, onboardingState }) => {
  if (!(creationRef.current && drawerRef.current)) {
    return null;
  }
  const anchor = {
    anchor: {
      left: creationRef.current.offsetLeft - drawerRef.current.offsetLeft - 48,
      top: creationRef.current.offsetTop + creationRef.current.offsetHeight - 48
    },
    place: 'left'
  };
  let onboardingComponent = getOnboardingComponentFor(onboardingSteps.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING, onboardingState, anchor);
  return getOnboardingComponentFor(onboardingSteps.ARTIFACT_MODIFIED_ONBOARDING, onboardingState, anchor, onboardingComponent);
};

const ReleaseTags = ({ existingTags = [] }) => {
  const [selectedTags, setSelectedTags] = useState(existingTags);
  const [isEditing, setIsEditing] = useState(false);

  const onToggleEdit = () => {
    setSelectedTags(existingTags);
    setIsEditing(toggle);
  };

  const onTagSelectionChanged = ({ selection }) => setSelectedTags(selection);

  const onSave = () => {
    console.log('saving tags', selectedTags);
  };

  const { classes } = useStyles();

  return (
    <div className="margin-bottom" style={{ maxWidth: 500 }}>
      <div className="flexbox center-aligned">
        <h4 className="margin-right">Tags</h4>
        {!isEditing && (
          <Button onClick={onToggleEdit} size="small" startIcon={<EditIcon />}>
            Edit
          </Button>
        )}
      </div>
      <ChipSelect
        className={classes.tagSelect}
        id="release-tags"
        label=""
        onChange={onTagSelectionChanged}
        disabled={!isEditing}
        key={`${isEditing}`}
        placeholder={isEditing ? 'Enter release tags' : 'Click edit to add release tags'}
        selection={selectedTags}
        options={existingTags}
      />
      <Collapse in={isEditing}>
        <div className="flexbox center-aligned margin-top-small" style={{ justifyContent: 'end' }}>
          <Button variant="contained" onClick={onSave} color="secondary" style={{ marginRight: 10 }}>
            Save
          </Button>
          <Button onClick={onToggleEdit}>Cancel</Button>
        </div>
      </Collapse>
    </div>
  );
};

const ArtifactsList = ({ artifacts, selectArtifact, selectedArtifact, setShowRemoveArtifactDialog, showHelptips }) => {
  const [sortCol, setSortCol] = useState('modified');
  const [sortDown, setSortDown] = useState(true);

  const onRowSelection = artifact => {
    if (!artifact || !selectedArtifact || selectedArtifact.id !== artifact.id) {
      return selectArtifact(artifact);
    }
    selectArtifact();
  };

  const sortColumn = col => {
    if (!col.sortable) {
      return;
    }
    // sort table
    setSortDown(toggle);
    setSortCol(col);
  };

  if (!artifacts.length) {
    return null;
  }

  const items = artifacts.sort(customSort(sortDown, sortCol));

  return (
    <>
      <h4>Artifacts in this Release:</h4>
      <div>
        <div className="release-repo-item repo-item repo-header">
          {columns.map(item => (
            <Tooltip key={item.name} className="columnHeader" title={item.title} placement="top-start" onClick={() => sortColumn(item)}>
              <div>
                {item.title}
                {item.sortable ? <SortIcon className={`sortIcon ${sortCol === item.name ? 'selected' : ''} ${sortDown.toString()}`} /> : null}
              </div>
            </Tooltip>
          ))}
          <div style={{ width: 48 }} />
        </div>
        {items.map((pkg, index) => {
          const expanded = !!(selectedArtifact && selectedArtifact.id === pkg.id);
          return (
            <Artifact
              key={`repository-item-${index}`}
              artifact={pkg}
              columns={columns}
              expanded={expanded}
              index={index}
              onRowSelection={() => onRowSelection(pkg)}
              // this will be run after expansion + collapse and both need some time to fully settle
              // otherwise the measurements are off
              showRemoveArtifactDialog={setShowRemoveArtifactDialog}
            />
          );
        })}
      </div>
      {showHelptips && (
        <span className="relative">
          <ExpandArtifact />
        </span>
      )}
    </>
  );
};

export const ReleaseDetails = () => {
  const [showRemoveDialog, setShowRemoveArtifactDialog] = useState(false);
  const [confirmReleaseDeletion, setConfirmReleaseDeletion] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const windowSize = useWindowSize();
  const creationRef = useRef();
  const drawerRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasReleaseTags } = useSelector(getFeatures);
  const onboardingState = useSelector(getOnboardingState);
  const pastDeploymentsCount = useSelector(state => state.deployments.byStatus.finished.total);
  const release = useSelector(state => state.releases.byId[state.releases.selectedRelease]) ?? {};
  const selectedArtifact = useSelector(state => state.releases.selectedArtifact);
  const showHelptips = useSelector(getShowHelptips);
  const userCapabilities = useSelector(getUserCapabilities);

  const onRemoveArtifact = artifact => dispatch(removeArtifact(artifact.id)).finally(() => setShowRemoveArtifactDialog(false));

  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/releases') + '/releases'.length);
    copy(`${location}/${release.Name}`);
    dispatch(setSnackbar('Link copied to clipboard'));
  };

  const onCloseClick = () => dispatch(selectRelease());

  const onCreateDeployment = () => {
    if (!onboardingState.complete) {
      dispatch(advanceOnboarding(onboardingSteps.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING));
      if (pastDeploymentsCount === 1) {
        dispatch(advanceOnboarding(onboardingSteps.ARTIFACT_MODIFIED_ONBOARDING));
      }
    }
    navigate(`${DEPLOYMENT_ROUTES.active.route}?open=true&release=${encodeURIComponent(release.Name)}`);
  };

  const onToggleReleaseDeletion = () => setConfirmReleaseDeletion(toggle);

  const onDeleteRelease = () => dispatch(removeRelease(release.Name)).then(() => setConfirmReleaseDeletion(false));

  const artifacts = release.Artifacts ?? [];
  return (
    <Drawer anchor="right" open={!!release.Name} onClose={onCloseClick} PaperProps={{ style: { minWidth: '60vw' }, ref: drawerRef }}>
      <div className="flexbox center-aligned space-between">
        <div className="flexbox center-aligned">
          <b>
            Release information for <i>{release.Name}</i>
          </b>
          <IconButton onClick={copyLinkToClipboard} size="large">
            <LinkIcon />
          </IconButton>
        </div>
        <div className="flexbox center-aligned">
          <div className="muted margin-right flexbox">
            <div className="margin-right-small">Last modified:</div>
            <RelativeTime updateTime={release.modified} />
          </div>
          <IconButton onClick={onCloseClick} aria-label="close" size="large">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider className="margin-bottom" />
      {hasReleaseTags && <ReleaseTags />}
      <ArtifactsList
        artifacts={artifacts}
        selectArtifact={artifact => dispatch(selectArtifact(artifact))}
        selectedArtifact={selectedArtifact}
        setShowRemoveArtifactDialog={setShowRemoveArtifactDialog}
        showHelptips={showHelptips}
      />
      <OnboardingComponent creationRef={creationRef} drawerRef={drawerRef} onboardingState={onboardingState} />
      <RemoveArtifactDialog
        artifact={selectedArtifact}
        open={!!showRemoveDialog}
        onCancel={() => setShowRemoveArtifactDialog(false)}
        onRemove={() => onRemoveArtifact(selectedArtifact)}
      />
      <RemoveArtifactDialog open={!!confirmReleaseDeletion} onRemove={onDeleteRelease} onCancel={onToggleReleaseDeletion} release={release} />
      <ReleaseQuickActions
        actionCallbacks={{ onCreateDeployment, onDeleteRelease: onToggleReleaseDeletion }}
        innerRef={creationRef}
        selectedRelease={release}
        userCapabilities={userCapabilities}
      />
    </Drawer>
  );
};

export default ReleaseDetails;
