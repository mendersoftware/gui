import React from 'react';

import CreateGroupExplainerContent, { defaultStyles } from '../devices/group-management/create-group-explainer-content';

const Devices = ({ isEnterprise }) => (
  <CreateGroupExplainerContent styles={{ ...defaultStyles, columns: 'one-column', groupType: { flexGrow: 1, padding: 0 } }} isEnterprise={isEnterprise} />
);

export default Devices;
