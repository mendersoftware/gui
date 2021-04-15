import React, { useState } from 'react';

import { AuthExplainButton } from '../../../helptips/helptooltips';
import AuthsetListItem from './authsetlistitem';

export const AuthsetList = ({ authsets, device, showHelptips, ...remainingProps }) => {
  const [expandRow, setExpandRow] = useState();
  return (
    <div className="authsets">
      <div className="header">
        {['', 'Status', 'Public key', 'Time of request', 'Actions'].map((headerName, index) => (
          <div className="columnHeader" key={`columnHeader-${index}`}>
            {headerName}
          </div>
        ))}
      </div>
      <div className="body" style={{ position: 'relative' }}>
        {showHelptips && <AuthExplainButton />}
        {authsets.map(
          authset =>
            authset && (
              <AuthsetListItem
                authset={authset}
                device={device}
                isExpanded={expandRow === authset.id}
                key={`authset-${authset.id}`}
                onExpand={setExpandRow}
                {...remainingProps}
              />
            )
        )}
      </div>
    </div>
  );
};

export default AuthsetList;
