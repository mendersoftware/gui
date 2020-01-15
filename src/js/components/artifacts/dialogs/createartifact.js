import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import ArtifactUpload from './artifactupload';
import ArtifactInformationForm from './artifactinformationform';

const steps = [
  { title: 'File Upload', component: ArtifactUpload },
  { title: 'Artifact information', component: ArtifactInformationForm }
];

export class CreateArtifactDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeStep: 0,
      fileSelected: false
    };
  }

  render() {
    const self = this;
    const { onCancel, onUpload, open, setSnackbar } = self.props;
    const { activeStep, fileSelected } = self.state;
    const finalStep = activeStep === steps.length - 1;
    const ComponentToShow = steps[activeStep].component;
    return (
      <Dialog open={open}>
        <DialogTitle>Upload an Artifact</DialogTitle>
        <DialogContent>
          <ComponentToShow setSnackbar={setSnackbar} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          {activeStep !== 0 && (
            <Button disabled={activeStep === 0} onClick={() => self.setState({ activeStep: activeStep - 1 })}>
              Back
            </Button>
          )}
          <div style={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            disabled={!fileSelected}
            onClick={finalStep ? () => onUpload() : () => self.setState({ activeStep: activeStep + 1 })}
          >
            {finalStep ? 'Upload' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default CreateArtifactDialog;
