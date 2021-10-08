import React, { useState } from 'react';
import Time from 'react-time';

import { DEVICE_STATES } from '../../../constants/deviceConstants';
import { TwoColumnData } from '../../common/configurationobject';
import DeviceNameInput from '../../common/devicenameinput';
import DeviceDataCollapse from './devicedatacollapse';
import LocaleFormatString from '../../common/timeformat';

const style = { maxWidth: '80%', gridTemplateColumns: 'minmax(max-content, 150px) auto' };
const previewStyle = { ...style, marginBottom: 5 };

const NameColumnData = ({ device, style }) => {
  return (
    <div
      className="break-all two-columns column-data compact"
      style={{ ...style, alignItems: 'center', gridTemplateColumns: 'minmax(max-content, 150px) max-content' }}
    >
      <div className="align-right key text-muted">
        <b>Name</b>
      </div>
      <DeviceNameInput device={device} isHovered />
    </div>
  );
};

export const DeviceIdentity = ({ device, setSnackbar }) => {
  const [open, setOpen] = useState(false);
  const { attributes = {}, created_ts, id, identity_data = {}, status = DEVICE_STATES.accepted } = device;

  const name = attributes.name ? { Name: attributes.name } : {};
  const { mac, ...remainingIdentity } = identity_data;

  let keyContent = {
    ID: id || '-',
    ...name,
    mac
  };

  let extendedContent = remainingIdentity;
  if (created_ts) {
    const createdTime = <Time value={created_ts} format={LocaleFormatString()} />;
    extendedContent[status === DEVICE_STATES.preauth ? 'Date added' : 'First request'] = createdTime;
  }

  const extendedContentLength = Object.keys(extendedContent).length;
  return (
    <DeviceDataCollapse
      header={
        <>
          <NameColumnData device={device} style={previewStyle} />
          <TwoColumnData config={keyContent} compact setSnackbar={setSnackbar} style={previewStyle} />
          {!open && !!extendedContentLength && <a onClick={setOpen}>show {extendedContentLength} more</a>}
        </>
      }
      isOpen={open}
      onClick={setOpen}
      title="Device identity"
    >
      <TwoColumnData config={extendedContent} compact setSnackbar={setSnackbar} style={style} />
      <a onClick={() => setOpen(false)}>show less</a>
    </DeviceDataCollapse>
  );
};

export default DeviceIdentity;
