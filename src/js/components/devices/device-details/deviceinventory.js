import React, { useState } from 'react';

import { extractSoftware } from '../../../helpers';
import { TwoColumnDataMultiple } from '../../common/configurationobject';
import DeviceInventoryLoader from './deviceinventoryloader';
import DeviceDataCollapse from './devicedatacollapse';

export const DeviceInventory = ({ device, docsVersion, setSnackbar }) => {
  const [open, setOpen] = useState(false);
  const { attributes = {} } = device;

  const { device_type, artifact_name, ...remainingAttributes } = attributes;

  const softwareInfo = extractSoftware(attributes);
  const keyAttributeCount = Object.keys(attributes).length - Object.keys(remainingAttributes).length;
  const { deviceInventory, keyContent } = Object.entries(remainingAttributes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, attribute, index) => {
        const softwareAttribute = softwareInfo.find(info => attribute[0].startsWith(info));
        if (!softwareAttribute) {
          const attributeValue = Array.isArray(attribute[1]) ? attribute[1].join(',') : attribute[1];
          if (index < keyAttributeCount) {
            accu.keyContent[attribute[0]] = attributeValue;
          } else {
            accu.deviceInventory[attribute[0]] = attributeValue;
          }
        }
        return accu;
      },
      { deviceInventory: {}, keyContent: { artifact_name, device_type } }
    );

  const waiting = !Object.values(attributes).some(i => i);
  const attributeCount = Object.keys(deviceInventory).length;
  return (
    <DeviceDataCollapse
      disableBottomBorder
      header={
        waiting ? (
          <DeviceInventoryLoader docsVersion={docsVersion} />
        ) : (
          <>
            <TwoColumnDataMultiple config={keyContent} setSnackbar={setSnackbar} style={{ marginBottom: 5 }} />
            {!open && !!attributeCount && <a onClick={setOpen}>show {attributeCount} more</a>}
          </>
        )
      }
      isOpen={open}
      onClick={setOpen}
      title="Device inventory"
    >
      <TwoColumnDataMultiple config={deviceInventory} setSnackbar={setSnackbar} />
      <a onClick={() => setOpen(false)}>show less</a>
    </DeviceDataCollapse>
  );
};

export default DeviceInventory;
