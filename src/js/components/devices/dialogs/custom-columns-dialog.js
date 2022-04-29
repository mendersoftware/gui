import React, { lazy, Suspense, useRef, useState } from 'react';

// material ui
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

import Loader from '../../common/loader';
const Content = lazy(() => import('./custom-columns-dialog-content'));

export const ColumnCustomizationDialog = ({ customColumnSizes, open, onCancel, onSubmit, ...props }) => {
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const buttonRef = useRef();

  const onHandleSubmit = () => {
    const attributes = selectedAttributes.map(attribute => ({
      id: attribute.id,
      key: attribute.key,
      name: attribute.key,
      scope: attribute.scope,
      title: attribute.title || attribute.key
    }));
    onSubmit(attributes, customColumnSizes);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Customize Columns</DialogTitle>
      <Suspense fallback={<Loader show />}>
        <Content buttonRef={buttonRef} selectedAttributes={selectedAttributes} setSelectedAttributes={setSelectedAttributes} {...props} />
      </Suspense>

      <DialogActions className="space-between">
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onHandleSubmit} color="secondary" ref={buttonRef}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnCustomizationDialog;
