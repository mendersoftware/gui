import React, { useState } from 'react';

import { extractSoftware } from '../../../helpers';
import { TwoColumnDataMultiple } from '../../common/configurationobject';
import DeviceInventoryLoader from './deviceinventoryloader';
import DeviceDataCollapse from './devicedatacollapse';

export const DeviceInventory = ({ device, docsVersion }) => {
  const [open, setOpen] = useState(false);
  const { attributes = {} } = device;

  const { device_type, artifact_name } = attributes;

  const softwareInfo = extractSoftware(attributes);
  const { deviceInventory, keyContent } = Object.entries(attributes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, attribute, index) => {
        const softwareAttribute = softwareInfo.find(info => attribute[0].startsWith(info));
        if (!softwareAttribute) {
          const attributeValue = Array.isArray(attribute[1]) ? attribute[1].join(',') : attribute[1];
          if (index < 4) {
            accu.keyContent[attribute[0]] = attributeValue;
          }
          accu.deviceInventory[attribute[0]] = attributeValue;
        }
        return accu;
      },
      { deviceInventory: { artifact_name, device_type }, keyContent: { artifact_name, device_type } }
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
          !open && (
            <>
              <TwoColumnDataMultiple config={keyContent} />
              {attributeCount - Object.keys(keyContent).length > 0 && <a onClick={setOpen}>show {attributeCount - Object.keys(keyContent).length} more</a>}
            </>
          )
        )
      }
      isOpen={open}
      onClick={setOpen}
      title="Device inventory"
    >
      <TwoColumnDataMultiple config={deviceInventory} />
      <a onClick={() => setOpen(false)}>show less</a>
    </DeviceDataCollapse>
  );
};

export default DeviceInventory;
