import React from 'react';
import { matchPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import LeftNav from './left-nav';
import GettingStarted from './getting-started';
import ApplicationUpdates from './application-updates';
import DebPackage from './application-updates/mender-deb-package';
import VirtualDevice from './application-updates/demo-virtual-device';
import UpdateModules from './application-updates/update-modules';
import SystemUpdates from './system-updates';
import BoardIntegrations from './system-updates/board-integrations';
import BuildYocto from './system-updates/build-with-yocto';
import IntegrateDebian from './system-updates/integrate-debian';
import ReleasesArtifacts from './releases-and-artifacts';
import BuildDemoArtifact from './releases-and-artifacts/build-demo-artifact';
import Support from './support';
import MoreHelp from './more-help-resources';
import { isEmpty, versionCompare } from '../../helpers';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';

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

export default class Help extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }
  _getInitialState() {
    return {
      snackbar: AppStore.getSnackbar(),
      hasMultitenancy: AppStore.hasMultitenancy(),
      isHosted: AppStore.getIsHosted()
    };
  }
  componentDidMount() {
    if (this.state.hasMultitenancy && this.state.isHosted) {
      this._getUserOrganization();
      this.setState({ version: '', docsVersion: '' }); // if hosted, use latest docs version
    } else {
      this.setState({ docsVersion: this.props.docsVersion ? `${this.props.docsVersion}/` : 'development/' });
    }
  }

  _getUserOrganization() {
    var self = this;
    return AppActions.getUserOrganization()
      .then(org => {
        self.setState({ org: org });
        self.linksTimer = setInterval(() => {
          self._getLinks(org.id);
        }, 30000);
        self._getLinks(org.id);
      })
      .catch(err => console.log(`Error: ${err}`));
  }

  _getLinks(id) {
    var self = this;
    AppActions.getHostedLinks(id)
      .then(response => {
        self.setState({ links: response });
        // clear timer when got links successfully
        clearInterval(self.linksTimer);
      })
      .catch(err => console.log(`Error: ${err}`, `Tenant id: ${id}`));
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentWillUnmount() {
    clearInterval(this.linksTimer);
    AppStore.removeChangeListener(this._onChange.bind(this));
  }

  _onChange() {
    this.setState(this._getInitialState());
  }

  _getLatest(array) {
    // returns latest version of format x.x.x
    array.sort(versionCompare);
    return array[array.length - 1];
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
        <LeftNav isHosted={this.state.isHosted} pages={components} />
        <div>
          <p style={{ color: 'rgba(0, 0, 0, 0.54)', maxWidth: contentWidth }}>Help {breadcrumbs}</p>
          <div style={{ position: 'relative', top: '12px', maxWidth: contentWidth }} className="help-content">
            <ComponentToShow
              version={this.props.version}
              docsVersion={this.state.docsVersion}
              getLatest={this._getLatest}
              isHosted={this.state.isHosted}
              org={this.state.org}
              links={this.state.links}
              hasMultitenancy={this.state.hasMultitenancy}
              isEmpty={isEmpty}
              pages={components}
            />
          </div>
        </div>
      </div>
    );
  }
}
