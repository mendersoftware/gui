import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';

import { useTheme } from '@mui/material';

import { getUserOrganization } from '../../actions/organizationActions';
import { getDocsVersion, getIsEnterprise } from '../../selectors';
import LeftNav from '../common/left-nav';
import DeviceSupport from './device-support';
import Devices from './devices';
import GetStarted from './getting-started';
import MoreHelp from './more-help-resources';
import ReleasesArtifacts from './releases-and-artifacts';
import BuildDemoArtifact from './releases-and-artifacts/build-demo-artifact';
import Support from './support';

const components = {
  'get-started': {
    title: 'Get started',
    component: GetStarted
  },
  devices: {
    title: 'Devices and device groups',
    component: Devices
  },
  'device-and-os-support': {
    title: 'Device and Operating System support',
    component: DeviceSupport
  },
  'releases-artifacts': {
    title: 'Releases and artifacts',
    component: ReleasesArtifacts,
    'build-demo-artifact': {
      title: 'Building a demo application update Artifact',
      component: BuildDemoArtifact
    }
  },
  support: {
    title: 'Support',
    component: Support,
    hosted: true
  },
  'more-help-resources': {
    title: 'More resources',
    component: MoreHelp
  }
};

const contentWidth = 780;

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
        exact: true
      });
      bag = eachRecursive(value, this_path, level + 1, bag, isHosted, spacing);
    }
    return bag;
  }, accu);

export const Help = ({
  demoArtifactLink,
  docsVersion,
  getUserOrganization,
  hasMultitenancy,
  isEnterprise,
  isHosted,
  location,
  menderArtifactVersion,
  menderVersion
}) => {
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
      <LeftNav sections={[{ itemClass: 'helpNav', items: links, title: 'Help topics' }]} />
      <div style={{ maxWidth: contentWidth }}>
        <p className="muted">Help {breadcrumbs}</p>
        <div className="help-content relative margin-top-small">
          <ComponentToShow
            demoArtifactLink={demoArtifactLink}
            docsVersion={docsVersion}
            isHosted={isHosted}
            isEnterprise={isEnterprise}
            menderVersion={menderVersion}
            menderArtifactVersion={menderArtifactVersion}
          />
        </div>
      </div>
    </div>
  );
};

const actionCreators = { getUserOrganization };

const mapStateToProps = state => {
  return {
    demoArtifactLink: state.app.demoArtifactLink,
    docsVersion: getDocsVersion(state),
    isHosted: state.app.features.isHosted,
    isEnterprise: getIsEnterprise(state),
    menderVersion: state.app.versionInformation['Mender-Client'],
    menderArtifactVersion: state.app.versionInformation['Mender-Artifact']
  };
};

export default connect(mapStateToProps, actionCreators)(Help);
