import React from 'react';
import { Link } from 'react-router-dom';

import { Launch as LaunchIcon } from '@mui/icons-material';
import DeviceIdentityDisplay from '../../common/deviceidentity';
import { BEGINNING_OF_TIME } from '../../../constants/appConstants';
import { makeStyles } from 'tss-react/mui';
import { TwoColumns } from '../../common/configurationobject';

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
    'System software version': device['rootfs-image.version'] || artifact_name || '-',
    ' ': (
      <Link to={`/auditlog?object_type=device&object_id=${device.id}&start_date=${BEGINNING_OF_TIME}`} onClick={onClose}>
        List all log entries for this device
      </Link>
    )
  };

  return <DetailInformation title="device" details={deviceDetails} />;
};

export default DeviceDetails;
