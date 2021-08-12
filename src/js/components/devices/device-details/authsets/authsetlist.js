import React, { useState } from 'react';

import { DEVICE_STATES } from '../../../../constants/deviceConstants';
import { AuthExplainButton } from '../../../helptips/helptooltips';
import AuthsetListItem from './authsetlistitem';

export const AuthsetList = ({ device, showHelptips, ...remainingProps }) => {
  const [expandRow, setExpandRow] = useState();
  const [open, setOpen] = useState(false);
  const { auth_sets: authsets = [], status = DEVICE_STATES.accepted } = device;

  let groupedAuthsets = authsets.reduce(
    // for each authset compare the device status and if it matches authset status, put it in correct list
    (accu, authset) => {
      if (authset.status === status) {
        accu.active.push(authset);
      } else if (authset.status === DEVICE_STATES.pending) {
        accu.active.unshift(authset);
      } else {
        accu.inactive.push(authset);
      }
      return accu;
    },
    { active: [], inactive: [] }
  );

  const activeAuthsets = groupedAuthsets.active;
  const inactiveAuthsets = groupedAuthsets.inactive;

  const getAuthsetList = authsets => {
    return authsets.map(authset => (
      <AuthsetListItem
        authset={authset}
        device={device}
        isExpanded={expandRow === authset.id}
        key={`authset-${authset.id}`}
        onExpand={setExpandRow}
        {...remainingProps}
      />
    ));
  };

  return (
    <div className="authsets">
      <div className="header">
        {['Status', 'Public key', 'Time of request', 'Actions'].map((headerName, index) => (
          <div className="columnHeader" key={`columnHeader-${index}`}>
            {headerName}
          </div>
        ))}
      </div>
      <div className="body" style={{ position: 'relative' }}>
        {showHelptips && <AuthExplainButton />}
        {getAuthsetList(activeAuthsets)}
        {open && getAuthsetList(inactiveAuthsets)}
        <div className="margin-top-small">
          {!!inactiveAuthsets.length &&
            (!open ? <a onClick={setOpen}>show {inactiveAuthsets.length} more</a> : <a onClick={() => setOpen(false)}>show less</a>)}
        </div>
      </div>
    </div>
  );
};

export default AuthsetList;
