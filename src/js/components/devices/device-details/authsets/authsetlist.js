import React, { useState } from 'react';

import { DEVICE_STATES } from '../../../../constants/deviceConstants';
import { customSort } from '../../../../helpers';
import { AuthExplainButton } from '../../../helptips/helptooltips';
import AuthsetListItem from './authsetlistitem';

export const AuthsetList = ({ device, showHelptips, ...remainingProps }) => {
  const [expandRow, setExpandRow] = useState();
  const { auth_sets: authsets = [], status = DEVICE_STATES.accepted } = device;

  let groupedAuthsets = authsets.reduce(
    // for each authset compare the device status and if it matches authset status, put it in correct list
    (accu, authset) => {
      if (authset.status === status) {
        accu.active.push(authset);
      } else if (authset.status === DEVICE_STATES.pending) {
        accu.pending.push(authset);
      } else {
        accu.inactive.push(authset);
      }
      return accu;
    },
    { active: [], inactive: [], pending: [] }
  );

  const orderedAuthsets = [
    ...groupedAuthsets.pending.sort(customSort(true, 'ts')),
    ...groupedAuthsets.active.sort(customSort(true, 'ts')),
    ...groupedAuthsets.inactive.sort(customSort(true, 'ts'))
  ];

  return (
    <div className="authsets">
      <div className="header">
        {['', 'Status', 'Public key', 'Time of request', 'Actions'].map((headerName, index) => (
          <div className="columnHeader" key={`columnHeader-${index}`}>
            {headerName}
          </div>
        ))}
      </div>
      <div className="body relative">
        {showHelptips && <AuthExplainButton />}
        {orderedAuthsets.map(authset => (
          <AuthsetListItem
            authset={authset}
            device={device}
            isExpanded={expandRow === authset.id}
            key={`authset-${authset.id}`}
            onExpand={setExpandRow}
            {...remainingProps}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthsetList;
