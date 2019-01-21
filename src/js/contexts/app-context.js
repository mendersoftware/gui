import React from 'react';

export const AppContext = React.createContext({
  docsVersion: '',
  version: '',
  uploadArtifact: () => {},
  artifactProgress: 0,
  globalSettings: {}
});
