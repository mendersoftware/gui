import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

import { TextField, Tooltip, Autocomplete } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import useWindowSize from '../../../utils/resizehook';
import AsyncAutocomplete from '../../common/asyncautocomplete';
import InfoHint from '../../common/info-hint';
import { ALL_DEVICES } from '../../../constants/deviceConstants';
import { getDeviceIdentityText } from '../../devices/base-devices';
import InfoText from '../../common/infotext';

const useStyles = makeStyles()(theme => ({
  infoStyle: {
    minWidth: 400,
    borderBottom: 'none'
  },
  selection: { minWidth: 'min-content', maxWidth: theme.spacing(50), minHeight: 96, marginBottom: theme.spacing(2) }
}));

const hardCodedStyle = {
  textField: {
    minWidth: 400
  }
};

export const ReleasesWarning = ({ lacksReleases }) => (
  <div className="flexbox center-aligned">
    <ErrorOutlineIcon fontSize="small" style={{ marginRight: 4, top: 4, color: 'rgb(171, 16, 0)' }} />
    <InfoText>
      There are no {lacksReleases ? 'compatible ' : ''}artifacts available.{lacksReleases ? <br /> : ' '}
      <Link to="/releases">Upload one to the repository</Link> to get started.
    </InfoText>
  </div>
);

export const Devices = ({ deploymentObject, groupRef, groups, hasDevices, hasDynamicGroups, hasPending, idAttribute, setDeploymentSettings }) => {
  const { classes } = useStyles();
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();

  const deploymentSettingsUpdate = (e, value) => setDeploymentSettings({ group: value });

  const { deploymentDeviceIds = [], device, group = null } = deploymentObject;

  const groupItems = [ALL_DEVICES, ...Object.keys(groups)];
  const groupLink = useMemo(() => {
    let groupLink = '/devices';
    if (device && device.attributes) {
      // If single device, don't show incompatible releases
      groupLink = `${groupLink}?id=${device.id}`;
    } else {
      groupLink = group && group !== ALL_DEVICES ? `${groupLink}?group=${group}` : groupLink;
    }
    return groupLink;
  }, [device, group]);

  return (
    <>
      <h4 className="margin-bottom-none margin-top-none">Select a device group to target</h4>
      <div ref={groupRef} className={classes.selection}>
        {device ? (
          <TextField value={getDeviceIdentityText({ device, idAttribute })} label="Device" disabled={true} className={classes.infoStyle} />
        ) : (
          <div>
            <Autocomplete
              id="deployment-device-group-selection"
              autoSelect
              autoHighlight
              filterSelectedOptions
              handleHomeEndKeys
              disabled={!(hasDevices || hasDynamicGroups)}
              options={groupItems}
              onChange={deploymentSettingsUpdate}
              renderInput={params => (
                <TextField {...params} placeholder="Select a device group" InputProps={{ ...params.InputProps }} className={classes.textField} />
              )}
              value={group}
            />
            {!(hasDevices || hasDynamicGroups) && (
              <InfoText style={{ marginTop: '10px' }}>
                <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)', position: 'relative' }} />
                There are no connected devices.{' '}
                {hasPending ? (
                  <span>
                    <Link to="/devices/pending">Accept pending devices</Link> to get started.
                  </span>
                ) : (
                  <span>
                    <Link to="/help/get-started">Read the help pages</Link> for help with connecting devices.
                  </span>
                )}
              </InfoText>
            )}
          </div>
        )}
        {(deploymentDeviceIds.length > 0 || group) && (
          <InfoText>
            {group ? (
              <>All devices{group !== ALL_DEVICES ? ' in this group' : null}</>
            ) : (
              <>
                {deploymentDeviceIds.length} {pluralize('devices', deploymentDeviceIds.length)}
              </>
            )}{' '}
            will be targeted. <Link to={groupLink}>View the {pluralize('devices', group === ALL_DEVICES ? 2 : deploymentDeviceIds.length)}</Link>
          </InfoText>
        )}
      </div>
    </>
  );
};

export const Software = ({
  commonClasses,
  deploymentObject,
  getReleases,
  releaseRef,
  releases,
  releasesById,
  releaseSelectionLocked,
  setDeploymentSettings
}) => {
  const [isLoadingReleases, setIsLoadingReleases] = useState(!releases.length);
  const { classes } = useStyles();
  const { device, release: deploymentRelease = null } = deploymentObject;

  useEffect(() => {
    setIsLoadingReleases(!releases.length);
  }, [releases.length]);

  const releaseItems = useMemo(() => {
    let releaseItems = releases.map(rel => releasesById[rel]);
    if (device && device.attributes) {
      // If single device, don't show incompatible releases
      releaseItems = releaseItems.filter(rel => rel.device_types_compatible.some(type => device.attributes.device_type.includes(type)));
    }
    return releaseItems;
  }, [releases, device]);

  const onReleaseSelectionChange = release => {
    if (release !== deploymentObject.release) {
      setDeploymentSettings({ release });
    }
  };

  const onReleaseInputChange = inputValue => {
    setIsLoadingReleases(!releases.length);
    return getReleases({ page: 1, perPage: 100, searchTerm: inputValue, searchOnly: true }).finally(() => setIsLoadingReleases(false));
  };

  const releaseDeviceTypes = (deploymentRelease && deploymentRelease.device_types_compatible) ?? [];
  const devicetypesInfo = (
    <Tooltip title={<p>{releaseDeviceTypes.join(', ')}</p>} placement="bottom">
      <span className="link">
        {releaseDeviceTypes.length} device {pluralize('types', releaseDeviceTypes.length)}
      </span>
    </Tooltip>
  );

  return (
    <>
      <h4 className="margin-bottom-none margin-top-none">Select a Release to deploy</h4>
      <div className={commonClasses.columns}>
        <div ref={releaseRef} className={classes.selection}>
          {releaseSelectionLocked ? (
            <TextField value={deploymentRelease?.Name} label="Release" disabled={true} className={classes.infoStyle} />
          ) : (
            <AsyncAutocomplete
              id="deployment-release-selection"
              initialValue={deploymentRelease?.Name}
              labelAttribute="Name"
              placeholder="Select a Release"
              selectionAttribute="Name"
              options={releaseItems}
              onChange={onReleaseInputChange}
              onChangeSelection={onReleaseSelectionChange}
              isLoading={isLoadingReleases}
              styles={hardCodedStyle}
            />
          )}
          {!releaseItems.length ? (
            <ReleasesWarning lacksReleases />
          ) : (
            !!releaseDeviceTypes.length && <InfoText style={{ marginBottom: 0 }}>This Release is compatible with {devicetypesInfo}.</InfoText>
          )}
        </div>
        <InfoHint content="The deployment will skip any devices in the group that are already on the target Release version, or that have an incompatible device type." />
      </div>
    </>
  );
};
