import React, { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { TIMEOUTS } from '../../../constants/appConstants';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { unionizeStrings } from '../../../helpers';
import Tracking from '../../../tracking';
import ArtifactInformationForm from './artifactinformationform';
import ArtifactUpload from './artifactupload';

const steps = [
  { title: 'File Upload', component: ArtifactUpload, validator: ({ fileSelected, isValidDestination }) => !(isValidDestination && fileSelected) },
  {
    title: 'Artifact information',
    component: ArtifactInformationForm,
    validator: ({ name, selectedDeviceTypes }) => !(selectedDeviceTypes.length && name.length)
  }
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
  const [name, setName] = useState('');
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
      return setTimeout(() => onUploadFinished(meta.name), TIMEOUTS.oneSecond);
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
  const isValidDestination = destination.length ? /^(?:\/|[a-z]+:\/\/)/.test(destination) : true;
  const disableProgress = steps[activeStep].validator({ selectedDeviceTypes, isValidDestination, fileSelected, name });
  return (
    <Dialog open={true} fullWidth={true} maxWidth="sm">
      <DialogTitle>Upload an Artifact</DialogTitle>
      <DialogContent className="dialog-content margin-top margin-left margin-right margin-bottom">
        <ComponentToShow
          advanceOnboarding={advanceOnboarding}
          customDeviceTypes={customDeviceTypes}
          destination={destination}
          deviceTypes={deviceTypes}
          file={file}
          isValidDestination={isValidDestination}
          name={name}
          onboardingState={onboardingState}
          releases={releases}
          selectedDeviceTypes={selectedDeviceTypes}
          setSnackbar={setSnackbar}
          updateCreation={onUpdateCreation}
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
        <Button variant="contained" color="primary" disabled={disableProgress} onClick={() => (finalStep ? onUpload() : onNextClick())}>
          {finalStep ? 'Upload' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddArtifactDialog;
