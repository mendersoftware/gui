import React, { useEffect } from 'react';

import { FileInformation } from './addartifact';

export const ArtifactUploadConfirmation = ({ creation = {}, onRemove, updateCreation }) => {
  const { file, type } = creation;

  useEffect(() => {
    updateCreation({ finalStep: true, isValid: true });
  }, []);

  return <FileInformation file={file} type={type} onRemove={onRemove} />;
};

export default ArtifactUploadConfirmation;
