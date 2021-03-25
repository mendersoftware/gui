import React, { useState } from 'react';

import { extractSoftwareInformation } from '../../../helpers';
import { TwoColumnData } from '../../common/configurationobject';
import DeviceInventoryLoader from './deviceinventoryloader';
import DeviceDataCollapse from './devicedatacollapse';

const softwareTitleMap = {
  'rootfs-image.version': { title: 'System software version', priority: 0 },
  'rootfs-image.checksum': { title: 'checksum', priority: 1 }
};

export const InstalledSoftware = ({ device, docsVersion, setSnackbar }) => {
  const [open, setOpen] = useState(false);
  const { attributes = {} } = device;

  let softwareInformation = Object.entries(extractSoftwareInformation(attributes, softwareTitleMap)).map(item => ({
    title: item[0],
    content: item[1].reduce(
      (accu, info) => ({
        ...accu,
        [info.primary]: info.secondary
      }),
      {}
    )
  }));

  if (!softwareInformation.length) {
    softwareInformation = [
      {
        title: softwareTitleMap['rootfs-image.version'].title,
        content: { [softwareTitleMap['rootfs-image.version'].title]: attributes.artifact_name }
      }
    ];
  }

  const waiting = !Object.values(attributes).some(i => i);
  const keyInfo = !waiting && softwareInformation.length ? softwareInformation.shift() : [];
  return (
    <DeviceDataCollapse
      header={
        waiting ? (
          <DeviceInventoryLoader docsVersion={docsVersion} />
        ) : (
          <>
            <div className="muted">{keyInfo.title}</div>
            <TwoColumnData
              className="margin-bottom margin-left-small margin-top-small"
              config={keyInfo.content}
              compact
              setSnackbar={setSnackbar}
              style={{ marginBottom: 5 }}
            />
            {!open && !!softwareInformation.length && <a onClick={setOpen}>show {softwareInformation.length} more</a>}
          </>
        )
      }
      isOpen={open}
      onClick={setOpen}
      title="Installed software"
    >
      {softwareInformation.map((layer, layerIndex) => (
        <div key={`layer-${layerIndex}`}>
          <div className="muted">{layer.title}</div>
          <TwoColumnData className="margin-bottom margin-left-small margin-top-small" config={layer.content} compact setSnackbar={setSnackbar} />
        </div>
      ))}
      <a onClick={() => setOpen(false)}>show less</a>
    </DeviceDataCollapse>
  );
};

export default InstalledSoftware;
