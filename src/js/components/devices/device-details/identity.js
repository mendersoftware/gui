import React, { useState } from 'react';
import Time from 'react-time';

import { DEVICE_STATES } from '../../../constants/deviceConstants';
import { TwoColumnData } from '../../common/configurationobject';
import DeviceDataCollapse from './devicedatacollapse';

const style = { maxWidth: '50%', gridTemplateColumns: 'minmax(max-content, 150px) auto' };

export const DeviceIdentity = ({ device }) => {
  const [open, setOpen] = useState(false);
  const { attributes = {}, created_ts, id, identity_data = {}, status = DEVICE_STATES.accepted } = device;

  const name = attributes.name ? { Name: attributes.name } : {};
  const { mac, ...remainingIdentity } = identity_data;

  let keyContent = {
    ID: id || '-',
    ...name,
    mac
  };

  let extendedContent = { ...keyContent, ...remainingIdentity };

  if (created_ts) {
    const createdTime = <Time value={created_ts} format="YYYY-MM-DD HH:mm" />;
    extendedContent[status === DEVICE_STATES.preauth ? 'Date added' : 'First request'] = createdTime;
  }

  return (
    <DeviceDataCollapse
      header={
        <>
          {!open && <TwoColumnData config={keyContent} compact style={style} />}
          {!(open || !Object.keys(extendedContent).length) && (
            <a onClick={setOpen}>show {Object.keys(extendedContent).length - Object.keys(keyContent).length} more</a>
          )}
        </>
      }
      isOpen={open}
      onClick={setOpen}
      title="Device identity"
    >
      <TwoColumnData config={extendedContent} compact style={style} />
      {open && <a onClick={() => setOpen(false)}>show less</a>}
    </DeviceDataCollapse>
  );
};

export default DeviceIdentity;
