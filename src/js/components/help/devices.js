import React from 'react';

import CreateGroupExplainerContent from '../devices/create-group-explainer-content';

const defaultStyles = {
  columns: 'one-column',
  groupType: { flexGrow: 1, padding: 0 },
  heading: { alignItems: 'center' },
  icon: { color: '#7b7b7b' },
  image: { maxWidth: '100%' }
};

const Devices = ({ isEnterprise }) => <CreateGroupExplainerContent styles={defaultStyles} isEnterprise={isEnterprise} />;

export default Devices;
