import React from 'react';

export const RedirectionWidget = ({ content, onClick }) => (
  <div className="widget flexbox centered" onClick={onClick}>
    <p className="muted" style={{ maxWidth: 200 }}>
      {content}
    </p>
  </div>
);

export default RedirectionWidget;
