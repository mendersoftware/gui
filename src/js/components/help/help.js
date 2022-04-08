import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';

import { useTheme, ListItemIcon } from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';

import { getUserOrganization } from '../../actions/organizationActions';
import { getDocsVersion, getIsEnterprise } from '../../selectors';
import LeftNav from '../common/left-nav';
import Support from './support';
import GetStarted from './getting-started';
import MenderHub from './mender-hub';

const components = {
  'get-started': {
    title: 'Getting started',
    component: GetStarted
  },
  'support': {
    title: 'Contact support',
    component: Support
  },
  'mender-hub': {
    title: 'Mender Hub',
    component: MenderHub
  },
  'documentation': {
    title: 'Documentation',
    url: 'https://docs.mender.io/'
  }
};

const contentWidth = 780;

const LinkIcon = () => (
  <ListItemIcon style={{ 'verticalAlign': 'middle' }}>
    <LaunchIcon style={{ 'fontSize': '1rem' }} />
  </ListItemIcon>
);

// build array of link list components
const eachRecursive = (obj, path, level, accu, isHosted, spacing) =>
  Object.entries(obj).reduce((bag, [key, value]) => {
    if (!isHosted && value.hosted) {
      return bag;
    }
    if (typeof value == 'object' && value !== null && key !== 'component') {
      const this_path = `${path}/${key}`;
      bag.push({
        title: value.title,
        level,
        path: this_path,
        hosted: value.hosted,
        style: { paddingLeft: `calc(${level} * ${spacing})` },
        exact: true,
        secondaryAction: value.url ? <LinkIcon /> : null,
        url: value.url ? value.url : ''
      });
      bag = eachRecursive(value, this_path, level + 1, bag, isHosted, spacing);
    }
    return bag;
  }, accu);

export const Help = ({ docsVersion, getUserOrganization, hasMultitenancy, isEnterprise, isHosted, location, menderVersion }) => {
  const theme = useTheme();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (hasMultitenancy || isEnterprise || isHosted) {
      getUserOrganization();
    }
    // generate sidebar links
    setLinks(eachRecursive(components, '/help', 1, [], isHosted, theme.spacing(2)));
  }, []);

  let ComponentToShow = GetStarted;
  let breadcrumbs = '';
  let routeParams = matchPath(location.pathname, { path: '/help/**' });
  if (routeParams && routeParams.params[0]) {
    let splitsplat = routeParams.params[0].split('/');
    let copyOfComponents = components;

    for (let i = 0; i < splitsplat.length; i++) {
      if (i === splitsplat.length - 1) {
        ComponentToShow = copyOfComponents[splitsplat[i]].component;
      } else {
        copyOfComponents = copyOfComponents[splitsplat[i]];
      }
    }

    breadcrumbs = splitsplat[0] ? '  >  ' + components[splitsplat[0]].title : '';
    breadcrumbs = splitsplat[1] ? breadcrumbs + '  >  ' + components[splitsplat[0]][splitsplat[1]].title : breadcrumbs;
  }

  return (
    <div className="help-container">
      <LeftNav sections={[{ itemClass: 'helpNav', items: links, title: 'Help & support' }]} />
      <div style={{ maxWidth: contentWidth }}>
        <p className="muted">Help & support {breadcrumbs}</p>
        <div className="help-content relative margin-top-small">
          <ComponentToShow docsVersion={docsVersion} isHosted={isHosted} menderVersion={menderVersion} />
        </div>
      </div>
    </div>
  );
};

const actionCreators = { getUserOrganization };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    isHosted: state.app.features.isHosted,
    isEnterprise: getIsEnterprise(state),
    menderVersion: state.app.versionInformation['Mender-Client']
  };
};

export default connect(mapStateToProps, actionCreators)(Help);
