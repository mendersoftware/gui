import React from 'react';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';
import LeftNav from './left-nav';
import GettingStarted from './getting-started';
import ApplicationUpdates from './application-updates';
import DebPackage from './application-updates/mender-deb-package';
import VirtualDevice from './application-updates/demo-virtual-device';
import UpdateModules from './application-updates/update-modules';
import Devices from './devices';
import SystemUpdates from './system-updates';
import BoardIntegrations from './system-updates/board-integrations';
import BuildYocto from './system-updates/build-with-yocto';
import IntegrateDebian from './system-updates/integrate-debian';
import ReleasesArtifacts from './releases-and-artifacts';
import BuildDemoArtifact from './releases-and-artifacts/build-demo-artifact';
import Support from './support';
import MoreHelp from './more-help-resources';

import { findLocalIpAddress } from '../../actions/appActions';
import { getUserOrganization } from '../../actions/userActions';

var components = {
  'getting-started': {
    title: 'Getting started',
    component: GettingStarted
  },
  'application-updates': {
    title: 'Application updates',
    component: ApplicationUpdates,
    'mender-deb-package': {
      title: 'Connecting your device using Mender .deb package',
      component: DebPackage
    },
    'demo-virtual-device': {
      title: 'Connecting a demo virtual device',
      component: VirtualDevice
    },
    'update-modules': {
      title: 'Enabling different kinds of updates with Update Modules',
      component: UpdateModules
    }
  },
  'system-updates': {
    title: 'System updates',
    component: SystemUpdates,
    'board-integrations': {
      title: 'Supported board integrations on Mender Hub',
      component: BoardIntegrations
    },
    'build-with-yocto': {
      title: 'Building a Mender-enabled Yocto image',
      component: BuildYocto
    },
    'integrate-debian': {
      title: 'Devices running Debian family',
      component: IntegrateDebian
    }
  },
  devices: {
    title: 'Devices and device groups',
    component: Devices
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

export class Help extends React.PureComponent {
  componentDidMount() {
    if (this.props.hasMultitenancy || this.props.isEnterprise || this.props.isHosted) {
      this.props.getUserOrganization();
    }
  }

  render() {
    var ComponentToShow = GettingStarted;
    var breadcrumbs = '';
    let routeParams = matchPath(this.props.location.pathname, { path: '/help/**' });
    if (routeParams && routeParams.params[0]) {
      var splitsplat = routeParams.params[0].split('/');
      var copyOfComponents = components;

      for (var i = 0; i < splitsplat.length; i++) {
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
        <LeftNav isHosted={this.props.isHosted} pages={components} />
        <div>
          <p style={{ color: 'rgba(0, 0, 0, 0.54)', maxWidth: contentWidth }}>Help {breadcrumbs}</p>
          <div style={{ position: 'relative', top: '12px', maxWidth: contentWidth }} className="help-content">
            <ComponentToShow
              docsVersion={this.props.docsVersion}
              findLocalIpAddress={this.props.findLocalIpAddress}
              isHosted={this.props.isHosted}
              isEnterprise={this.props.isEnterprise}
              menderDebPackageVersion={this.props.menderDebPackageVersion}
              menderVersion={this.props.menderVersion}
              menderArtifactVersion={this.props.menderArtifactVersion}
              org={this.props.org}
            />
          </div>
        </div>
      </div>
    );
  }
}

const actionCreators = { getUserOrganization, findLocalIpAddress };

const mapStateToProps = state => {
  // if hosted, use latest docs version
  const docsVersion = state.app.docsVersion ? `${state.app.docsVersion}/` : 'development/';
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    docsVersion: state.app.features.isHosted ? '' : docsVersion,
    isHosted: state.app.features.isHosted,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    menderVersion: state.app.versionInformation['Mender-Client'],
    menderDebPackageVersion: state.app.menderDebPackageVersion,
    menderArtifactVersion: state.app.versionInformation['Mender-Artifact'],
    org: state.users.organization,
    version: state.app.versionInformation.Integration
  };
};

export default connect(mapStateToProps, actionCreators)(Help);
