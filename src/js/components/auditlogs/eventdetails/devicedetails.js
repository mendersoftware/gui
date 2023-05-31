// Copyright 2021 Northern.tech AS
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
import React from 'react';
import { Link } from 'react-router-dom';

import { Launch as LaunchIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { BEGINNING_OF_TIME } from '../../../constants/appConstants';
import { AUDIT_LOGS_TYPES } from '../../../constants/organizationConstants';
import { rootfsImageVersion } from '../../../constants/releaseConstants';
import { formatAuditlogs } from '../../../utils/locationutils';
import { TwoColumns } from '../../common/configurationobject';
import DeviceIdentityDisplay from '../../common/deviceidentity';

const useStyles = makeStyles()(theme => ({
  eventDetails: { gridTemplateColumns: 'minmax(max-content, 150px) max-content', rowGap: theme.spacing(2.5) },
  deviceLink: { color: theme.palette.text.secondary, fontWeight: 'initial' }
}));

export const DetailInformation = ({ title, details }) => {
  const { classes } = useStyles();
  return (
    <div key={`${title}-details`} className="flexbox column margin-top-small">
      <b className="margin-bottom-small capitalized-start">{title} details</b>
      <TwoColumns className={classes.eventDetails} items={details} />
    </div>
  );
};

const deviceAuditlogType = AUDIT_LOGS_TYPES.find(type => type.value === 'device');

export const DeviceDetails = ({ device, idAttribute, onClose }) => {
  const { classes } = useStyles();
  const { name, device_type: deviceTypes, artifact_name } = device.attributes;
  const usesId = !idAttribute || idAttribute === 'id' || idAttribute === 'Device ID';
  const nameContainer = name ? { Name: name } : {};
  const deviceDetails = {
    ...nameContainer,
    [usesId ? 'Device ID' : idAttribute]: (
      <Link className={`flexbox center-aligned ${classes.deviceLink}`} to={`/devices?id=${device.id}`}>
        <DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} />
        <LaunchIcon className="margin-left-small link-color" fontSize="small" />
      </Link>
    ),
    'Device type': deviceTypes,
    'Operating system version': device[rootfsImageVersion] || artifact_name || '-',
    ' ': (
      <Link
        to={`/auditlog?${formatAuditlogs({ pageState: { type: deviceAuditlogType, detail: device.id, startDate: BEGINNING_OF_TIME } }, {})}`}
        onClick={onClose}
      >
        List all log entries for this device
      </Link>
    )
  };

  return <DetailInformation title="device" details={deviceDetails} />;
};

export default DeviceDetails;
