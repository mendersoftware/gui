import React, { useState } from 'react';

import AuthsetListItem from './authsetlistitem';

export const AuthsetList = ({ active, authsets, hideHeader, ...remainingProps }) => {
  const [expandRow, setExpandRow] = useState();

  return (
    <div className="authsets">
      {!hideHeader && (
        <div className="flexbox header">
          {['Public key', 'Request time', 'Status', 'Actions'].map((headerName, index) => (
            <div className="columnHeader" key={`columnHeader-${index}`}>
              {headerName}
            </div>
          ))}
        </div>
      )}
      <div className="body">
        {authsets.map(authset => (
          <AuthsetListItem
            authset={authset}
            isActive={active}
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
