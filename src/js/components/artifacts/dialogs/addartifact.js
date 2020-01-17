import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import ArtifactUpload from './artifactupload';
import ArtifactInformationForm from './artifactinformationform';

const steps = [
  { title: 'File Upload', component: ArtifactUpload },
  { title: 'Artifact information', component: ArtifactInformationForm }
];

export class AddArtifactDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeStep: 0,
      customDeviceTypes: '',
      destination: null,
      file: null,
      selectedDeviceTypes: []
    };
  }

  onUpdate(update) {
    this.setState(update);
  }

  onUpload({ customDeviceTypes, file, destination, selectedDeviceTypes, name }) {
    const otherDeviceTypes = customDeviceTypes.split(',');
    const deviceTypes = selectedDeviceTypes.concat(otherDeviceTypes);

    const meta = { description: '', deviceTypes, file, destination, name };
    this.props.onUpload(meta, file);
  }

  render() {
    const self = this;
    const { deviceTypes = [], onCancel, open, setSnackbar } = self.props;
    const { activeStep, destination, file } = self.state;
    const finalStep = activeStep === steps.length - 1;
    const ComponentToShow = steps[activeStep].component;
    const fileSelected = file && destination.length > 0;
    return (
      <Dialog open={open} fullWidth={true} maxWidth="sm">
        <DialogTitle>Upload an Artifact</DialogTitle>
        <DialogContent className="dialog-content margin-top margin-left margin-right margin-bottom">
          <ComponentToShow setSnackbar={setSnackbar} updateCreation={(...args) => self.onUpdate(...args)} deviceTypes={deviceTypes} {...self.state} />
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
            onClick={finalStep ? () => self.onUpload(self.state) : () => self.setState({ activeStep: activeStep + 1 })}
          >
            {finalStep ? 'Upload' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AddArtifactDialog;
