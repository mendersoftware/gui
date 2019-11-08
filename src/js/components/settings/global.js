import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';

import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import Form from '../common/forms/form';
import SelectInput from '../common/forms/selectinput';
import { preformatWithRequestID, deepCompare } from '../../helpers';

import { getDevicesByStatus } from '../../actions/deviceActions';
import AppActions from '../../actions/app-actions';

class Global extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: true,
      settings: {
        id_attribute: 'Device ID'
      },
      updatedSettings: {
        id_attribute: 'Device ID'
      }
    };
  }
  componentDidMount() {
    this.getSettings();
    this.props.getDevicesByStatus(null, 1, 500);
  }
  getSettings() {
    var self = this;
    return AppActions.getGlobalSettings()
      .then(settings => self.setState({ settings, updatedSettings: Object.assign(self.state.updatedSettings, settings) }))
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
    const id_attributes = this.props.attributes.reduce(
      (accu, value) => {
        accu.push({ value, label: value });
        return accu;
      },
      [{ value: 'Device ID', label: 'Device ID' }]
    );

    const id_hint = (
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
              <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
              {`These settings apply to all users, so changes made here may affect other users' experience.`}
            </p>
          </div>
        )}

        <Form>
          <SelectInput
            hint="Device identity attribute"
            label="Device identity attribute"
            id="deviceid"
            onChange={value => this.changeIdAttribute(value)}
            menuItems={id_attributes}
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
            <Button variant="contained" onClick={() => this.saveSettings()} disabled={!changed} color="primary">
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus };

const mapStateToProps = state => {
  return {
    // limit the selection of the available attribute to AVAILABLE_ATTRIBUTE_LIMIT
    attributes: state.devices.filteringAttributes.slice(0, state.devices.filteringAttributesLimit)
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(Global);
