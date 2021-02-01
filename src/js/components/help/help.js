import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';
import LeftNav from './left-nav';
import GetStarted from './getting-started';
import DeviceSupport from './device-support';
import Devices from './devices';
import ReleasesArtifacts from './releases-and-artifacts';
import BuildDemoArtifact from './releases-and-artifacts/build-demo-artifact';
import Support from './support';
import MoreHelp from './more-help-resources';

import { getUserOrganization } from '../../actions/organizationActions';
import { getDocsVersion, getIsEnterprise } from '../../selectors';

var components = {
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
  useEffect(() => {
    if (hasMultitenancy || isEnterprise || isHosted) {
      getUserOrganization();
    }
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

  const contentWidth = 780;

  return (
    <div className="help-container">
      <LeftNav isHosted={isHosted} pages={components} />
      <div>
        <p style={{ color: 'rgba(0, 0, 0, 0.54)', maxWidth: contentWidth }}>Help {breadcrumbs}</p>
        <div style={{ position: 'relative', top: '12px', maxWidth: contentWidth }} className="help-content">
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
