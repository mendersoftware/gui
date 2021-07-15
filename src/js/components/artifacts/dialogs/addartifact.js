import React, { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import ArtifactUpload from './artifactupload';
import ArtifactInformationForm from './artifactinformationform';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { unionizeStrings } from '../../../helpers';
import Tracking from '../../../tracking';

const steps = [
  { title: 'File Upload', component: ArtifactUpload },
  { title: 'Artifact information', component: ArtifactInformationForm }
];

export const AddArtifactDialog = ({
  advanceOnboarding,
  createArtifact,
  deviceTypes = [],
  onboardingState,
  onCancel,
  onUploadFinished,
  onUploadStarted,
  pastCount,
  releases,
  selectedFile,
  setSnackbar,
  uploadArtifact
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [customDeviceTypes, setCustomDeviceTypes] = useState('');
  const [destination, setDestination] = useState(!onboardingState.complete ? '/var/www/localhost/htdocs' : '');
  const [file, setFile] = useState();
  const [name, setName] = useState();
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState([]);
  const { name: filename = '' } = file || {};

  useEffect(() => {
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const onUpload = () => {
    let meta = { description: '' };
    if (filename.endsWith('.mender')) {
      return addArtifact(meta, file, 'upload');
    }
    const otherDeviceTypes = customDeviceTypes.split(',');
    const deviceTypes = unionizeStrings(selectedDeviceTypes, otherDeviceTypes);
    meta = { ...meta, device_types_compatible: deviceTypes, args: { dest_dir: destination, filename }, name };
    return addArtifact(meta, file, 'create');
  };

  const addArtifact = (meta, file, type = 'upload') => {
    const upload = type === 'create' ? createArtifact(meta, file) : uploadArtifact(meta, file);
    onUploadStarted();
    return upload.then(() => {
      if (!onboardingState.complete && deviceTypes.length && pastCount) {
        advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_TIP);
        if (type === 'create') {
          advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_RELEASE_NAME);
        }
      }
      // track in GA
      Tracking.event({ category: 'artifacts', action: 'create' });
      return setTimeout(onUploadFinished, 1000);
    });
  };

  const onUpdateCreation = update => {
    const updatedCreation = {
      customDeviceTypes,
      destination,
      file,
      name,
      selectedDeviceTypes,
      ...update
    };
    if (updatedCreation.selectedDeviceTypes.length || updatedCreation.customDeviceTypes.length > 3) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE);
    }
    setCustomDeviceTypes(updatedCreation.customDeviceTypes);
    setDestination(updatedCreation.destination);
    setFile(updatedCreation.file);
    setName(updatedCreation.name);
    setSelectedDeviceTypes(updatedCreation.selectedDeviceTypes);
  };

  const onNextClick = () => {
    if (!onboardingState.complete && activeStep === 0 && destination) {
      advanceOnboarding(onboardingSteps.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION);
    }
    setActiveStep(activeStep + 1);
  };

  const ComponentToShow = steps[activeStep].component;
  const fileSelected = file && (destination.length > 0 || filename.endsWith('.mender'));
  const finalStep = activeStep === steps.length - 1 || (file && filename.endsWith('.mender'));
  return (
    <Dialog open={true} fullWidth={true} maxWidth="sm">
      <DialogTitle>Upload an Artifact</DialogTitle>
      <DialogContent className="dialog-content margin-top margin-left margin-right margin-bottom">
        <ComponentToShow
          advanceOnboarding={advanceOnboarding}
          deviceTypes={deviceTypes}
          onboardingState={onboardingState}
          releases={releases}
          setSnackbar={setSnackbar}
          updateCreation={onUpdateCreation}
          customDeviceTypes={customDeviceTypes}
          destination={destination}
          file={file}
          name={name}
          selectedDeviceTypes={selectedDeviceTypes}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        {activeStep !== 0 && (
          <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
        <div style={{ flexGrow: 1 }} />
        <Button variant="contained" color="primary" disabled={!fileSelected} onClick={() => (finalStep ? onUpload() : onNextClick())}>
          {finalStep ? 'Upload' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddArtifactDialog;
