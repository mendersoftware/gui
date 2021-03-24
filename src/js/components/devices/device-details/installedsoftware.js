import React from 'react';

import { List } from '@material-ui/core';

import { extractSoftwareInformation } from '../../../helpers';
import ExpandableAttribute from '../../common/expandable-attribute';
import DeviceInventoryLoader from './deviceinventoryloader';
import DeviceDataCollapse from './devicedatacollapse';

const listItemTextClass = { secondary: 'inventory-text' };

const softwareTitleMap = {
  'rootfs-image.version': { title: 'System software version', priority: 0 },
  'rootfs-image.checksum': { title: 'checksum', priority: 1 }
};

export const InstalledSoftware = ({ device, docsVersion, setSnackbar }) => {
  const { attributes = {} } = device;

  const softwareInformation = Object.entries(extractSoftwareInformation(attributes, softwareTitleMap)).map(item => ({
    title: item[0],
    content: item[1].map((info, index) => (
      <ExpandableAttribute
        key={`${item[0]}-info-${index}`}
        primary={info.primary}
        secondary={info.secondary}
        textClasses={listItemTextClass}
        copyToClipboard={true}
        setSnackbar={setSnackbar}
      />
    ))
  }));

  const waiting = !Object.values(attributes).some(i => i);
  return (
    <DeviceDataCollapse title="Installed software">
      {waiting ? (
        <DeviceInventoryLoader docsVersion={docsVersion} />
      ) : (
        !!softwareInformation.length &&
        softwareInformation.map((layer, layerIndex) => (
          <div className="flexbox column" key={`layer-${layerIndex}`}>
            <div className="margin-top-small">{layer.title}</div>
            <List>{layer.content}</List>
          </div>
        ))
      )}
    </DeviceDataCollapse>
  );
};

export default InstalledSoftware;
