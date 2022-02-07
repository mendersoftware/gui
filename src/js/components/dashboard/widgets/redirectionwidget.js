import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import { Button } from '@mui/material';

export const RedirectionWidget = ({ buttonContent, content, isActive, onClick, target }) => (
  <div className="onboard widget" onClick={onClick}>
    <div>
      <p className={isActive ? '' : 'muted'}>{content}</p>
    </div>
    <Button component={Link} to={target}>
      {buttonContent}
    </Button>
  </div>
);

export default RedirectionWidget;
