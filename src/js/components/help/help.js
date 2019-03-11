import React from 'react';
import { Link, matchPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import HelpTopics from './helptopics';
import LeftNav from './left-nav';
import ConnectingDevices from './connecting-devices';
import ProvisionDemo from './connecting-devices/provision-a-demo';
import VirtualDevice from './connecting-devices/virtual-device';
import RaspberryPi from './connecting-devices/raspberry-pi-3';
import BeagleBoneBlack from './connecting-devices/beagleboneblack';
import DemoArtifacts from './connecting-devices/demo-artifacts';
import BuildYocto from './connecting-devices/build-with-yocto';
import IntegrateDebian from './connecting-devices/integrate-debian';
import MoreHelp from './more-help-resources';
import { isEmpty, versionCompare } from '../../helpers';
import BoardIcon from '@material-ui/icons/DeveloperBoard';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Support from './support';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';

var components = {
  'connecting-devices': {
    title: 'Connecting devices',
    component: ConnectingDevices,
    icon: BoardIcon,
    'provision-a-demo': {
      title: 'Provision a demo device',
      component: ProvisionDemo,
      'virtual-device': {
        title: 'Virtual device',
        component: VirtualDevice
      },
      'raspberry-pi-3': {
        title: 'Raspberry Pi 3',
        component: RaspberryPi
      },
      beagleboneblack: {
        title: 'BeagleBone Black',
        component: BeagleBoneBlack
      }
    },
    'demo-artifacts': {
      title: 'Download demo Artifacts',
      component: DemoArtifacts
    },
    'build-with-yocto': {
      title: 'Build with Yocto',
      component: BuildYocto
    },
    'integrate-debian': {
      title: 'Integrate with Debian',
      component: IntegrateDebian
    }
  },
  'more-help-resources': {
    title: 'More help resources',
    component: MoreHelp,
    icon: HelpIcon
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
      isHosted: window.location.hostname === 'hosted.mender.io'
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
    var ComponentToShow = HelpTopics;
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
    }

    return (
      <div style={{ marginTop: '-15px' }}>
        <div className="leftFixed">
          <LeftNav pages={components} changePage={path => this.changePage(path)} />
        </div>
        <div className="rightFluid padding-right" style={{ maxWidth: '980px', paddingTop: '0', paddingLeft: '45px' }}>
          <div style={{ position: 'relative', top: '12px' }} className="help-content">
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
            {ComponentToShow !== HelpTopics ? (
              <p className="margin-top-large">
                <Link to="/help">&lsaquo; Back to help topics</Link>
              </p>
            ) : null}
            <Support />
          </div>
        </div>
      </div>
    );
  }
}
