import React from 'react';
import Form from '../common/forms/form';
import SelectInput from '../common/forms/selectinput';
import { preformatWithRequestID, deepCompare } from '../../helpers';

require('../common/prototype/Array.prototype.equals');

import AppActions from '../../actions/app-actions';

import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

const AVAILABLE_ATTRIBUTE_LIMIT = 10;

export default class Global extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: true,
      settings: {
        id_attribute: 'Device ID'
      },
      updatedSettings: {
        id_attribute: 'Device ID'
      },
      id_attributes: [{ value: 'Device ID', label: 'Device ID' }]
    };
  }
  componentDidMount() {
    this.getSettings();
    this.getIdentityAttributes();
  }
  getSettings() {
    var self = this;
    return AppActions.getGlobalSettings()
      .then(settings => self.setState({ settings, updatedSettings: settings }))
      .catch(err => console.log(`error:${err}`));
  }
  getIdentityAttributes() {
    var self = this;
    AppActions.getDevicesByStatus(null, 1, 500)
      .then(devices => {
        const availableAttributes = devices.reduce((accu, item) => {
          return Object.keys(item.identity_data).reduce((keyAccu, key) => {
            keyAccu[key] = keyAccu[key] + 1 || 1;
            return keyAccu;
          }, accu);
        }, {});
        const id_attributes = Object.entries(availableAttributes)
          // sort in reverse order, to have most common attribute at the top of the select
          .sort((a, b) => b[1] - a[1])
          // limit the selection of the available attribute to AVAILABLE_ATTRIBUTE_LIMIT
          .slice(0, AVAILABLE_ATTRIBUTE_LIMIT)
          .reduce(
            (accu, item) => {
              accu.push({ value: item[0], label: item[0] });
              return accu;
            },
            [{ value: 'Device ID', label: 'Device ID' }]
          );
        self.setState({ id_attributes });
      })
      .catch(err => console.log(`error:${err}`));
  }

  changeIdAttribute(value) {
    const updatedSettings = Object.assign({}, this.state.updatedSettings, { id_attribute: value });
    this.setState({ updatedSettings });
  }

  hasChanged() {
    // compare to see if any changes were made
    var changed = this.state.updatedSettings ? !deepCompare(this.state.settings, this.state.updatedSettings) : false;
    return changed;
  }

  undoChanges() {
    var self = this;
    this.setState({ updatedSettings: self.state.settings });
    if (this.props.dialog) {
      this.props.closeDialog();
    }
  }

  saveSettings() {
    var self = this;
    return AppActions.saveGlobalSettings(self.state.updatedSettings)
      .then(() => {
        self.setState({ settings: self.state.updatedSettings });
        AppActions.setSnackbar('Settings saved successfully');
        if (self.props.dialog) {
          self.props.closeDialog();
        }
      })
      .catch(err => {
        console.log(err);
        AppActions.setSnackbar(preformatWithRequestID(err.res, `The settings couldn't be saved. ${err.res.body.error}`));
      });
  }

  render() {
    var changed = this.hasChanged();
    var id_hint = (
      <div>
        <p>Choose a device identity attribute to use to identify your devices throughout the UI.</p>
        <p>
          <a href="https://docs.mender.io/client-configuration/identity" target="_blank">
            Learn how to add custom identity attributes
          </a>{' '}
          to your devices.
        </p>
      </div>
    );

    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        {this.props.dialog ? null : (
          <div>
            <h2 style={{ marginTop: '15px' }}>Global settings</h2>
            <p className="info" style={{ marginBottom: '30px' }}>
              <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px' }}>
                info_outline
              </Icon>
              These settings apply to all users, so changes made here may affect other users' experience.
            </p>
          </div>
        )}

        <Form>
          <SelectInput
            hint="Device identity attribute"
            label="Device identity attribute"
            id="deviceid"
            onChange={value => this.changeIdAttribute(value)}
            menuItems={this.state.id_attributes}
            style={{ width: '400px' }}
            value={this.state.updatedSettings.id_attribute || ''}
            extraHint={id_hint}
          />
        </Form>

        <div className="margin-top-large">
          <div className="float-right">
            <Button disabled={!changed && !this.props.dialog} onClick={() => this.undoChanges()} style={{ marginRight: '10px' }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => this.saveSettings()} disabled={!changed} primary="true">
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
