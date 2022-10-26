import React from 'react';

export const RedirectionWidget = ({ content, onClick }) => (
  <div className="widget" onClick={onClick}>
    <p className="muted flexbox centered" style={{ maxWidth: 200 }}>
      {content}
    </p>
  </div>
);

export default RedirectionWidget;
