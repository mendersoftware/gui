import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import ArtifactUpload from './artifactupload';
import ArtifactInformationForm from './artifactinformationform';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { unionizeStrings } from '../../../helpers';

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
      destination: !props.onboardingState.complete ? '/var/www/localhost/htdocs' : '',
      file: null,
      selectedDeviceTypes: []
    };
  }

  componentDidMount() {
    if (this.props.selectedFile) {
      this.setState({ file: this.props.selectedFile });
    }
  }

  onUpload({ customDeviceTypes, file, destination, selectedDeviceTypes, name }) {
    let meta = { description: '' };
    const filename = file ? file.name : '';
    if (filename.endsWith('.mender')) {
      return this.props.onUpload(meta, file);
    }
    if (!this.props.onboardingState.complete && this.props.releases.length) {
      this.props.advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE);
    }
    const otherDeviceTypes = customDeviceTypes.split(',');
    const deviceTypes = unionizeStrings(selectedDeviceTypes, otherDeviceTypes);
    meta = { ...meta, device_types_compatible: deviceTypes, args: { dest_dir: destination, filename }, name };
    this.props.onCreate(meta, file);
  }

  render() {
    const self = this;
    const { advanceOnboarding, deviceTypes = [], onboardingState, onCancel, open, releases, setSnackbar } = self.props;
    const { activeStep, destination, file } = self.state;
    const ComponentToShow = steps[activeStep].component;
    const fileSelected = file && (destination.length > 0 || file.name.endsWith('.mender'));
    const finalStep = activeStep === steps.length - 1 || (file && file.name.endsWith('.mender'));
    return (
      <Dialog open={open} fullWidth={true} maxWidth="sm">
        <DialogTitle>Upload an Artifact</DialogTitle>
        <DialogContent className="dialog-content margin-top margin-left margin-right margin-bottom">
          <ComponentToShow
            advanceOnboarding={advanceOnboarding}
            deviceTypes={deviceTypes}
            onboardingState={onboardingState}
            releases={releases}
            setSnackbar={setSnackbar}
            updateCreation={(...args) => self.setState(...args)}
            {...self.state}
          />
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
