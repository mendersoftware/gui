import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';

import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import Form from '../common/forms/form';
import SelectInput from '../common/forms/selectinput';
import { preformatWithRequestID, deepCompare } from '../../helpers';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { getGlobalSettings, saveGlobalSettings } from '../../actions/userActions';

import { setSnackbar } from '../../actions/appActions';

export class Global extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: true,
      updatedSettings: {
        id_attribute: 'Device ID'
      }
    };
  }
  componentDidMount() {
    if (!this.props.settings || !this.props.devicesCount > 20) {
      this.props.getGlobalSettings();
      this.props.getDevicesByStatus(null, 1, 500);
    }
  }
  componentDidUpdate(prevProps) {
    if (!deepCompare(prevProps.settings, this.props.settings)) {
      this.setState({ updatedSettings: { ...this.state.updatedSettings, ...this.props.settings } });
    }
  }

  changeIdAttribute(value) {
    const updatedSettings = Object.assign({}, this.state.updatedSettings, { id_attribute: value });
    this.setState({ updatedSettings });
  }

  hasChanged() {
    // compare to see if any changes were made
    var changed = this.state.updatedSettings ? !deepCompare(this.props.settings, this.state.updatedSettings) : false;
    return changed;
  }

  undoChanges() {
    var self = this;
    this.setState({ updatedSettings: self.props.settings });
    if (this.props.dialog) {
      this.props.closeDialog();
    }
  }

  saveSettings() {
    var self = this;
    return self.props
      .saveGlobalSettings(self.state.updatedSettings)
      .then(() => {
        self.props.setSnackbar('Settings saved successfully');
        if (self.props.dialog) {
          self.props.closeDialog();
        }
      })
      .catch(err => {
        console.log(err);
        self.props.setSnackbar(preformatWithRequestID(err.res, `The settings couldn't be saved. ${err.res.body.error}`));
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
        {!this.props.dialog && (
          <>
            <h2 style={{ marginTop: '15px' }}>Global settings</h2>
            <p className="info" style={{ marginBottom: '30px' }}>
              <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
              {`These settings apply to all users, so changes made here may affect other users' experience.`}
            </p>
          </>
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

        <div className="margin-top-large float-right">
          <Button disabled={!changed && !this.props.dialog} onClick={() => this.undoChanges()} style={{ marginRight: '10px' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => this.saveSettings()} disabled={!changed} color="primary">
            Save
          </Button>
        </div>
      </div>
    );
  }
}

const actionCreators = { getDevicesByStatus, getGlobalSettings, saveGlobalSettings, setSnackbar };

const mapStateToProps = state => {
  return {
    // limit the selection of the available attribute to AVAILABLE_ATTRIBUTE_LIMIT
    attributes: state.devices.filteringAttributes.slice(0, state.devices.filteringAttributesLimit),
    devicesCount: Object.keys(state.devices.byId).length,
    settings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(Global);
