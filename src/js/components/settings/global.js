import React from 'react';
import { connect } from 'react-redux';
import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { getGlobalSettings, saveGlobalSettings } from '../../actions/userActions';
import { deepCompare } from '../../helpers';
import { getDocsVersion } from '../../selectors';

export class Global extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: true,
      updatedSettings: { ...props.settings }
    };
    if (!props.settings || !props.devicesCount > 20) {
      props.getGlobalSettings();
      props.getDevicesByStatus(null, 1, 500);
    }
  }

  componentDidUpdate(prevProps) {
    if (!deepCompare(prevProps.settings, this.props.settings)) {
      this.setState({ updatedSettings: { ...this.state.updatedSettings, ...this.props.settings } });
    }
  }

  changeIdAttribute(value) {
    const updatedSettings = { ...this.state.updatedSettings, id_attribute: value };
    this.setState({ updatedSettings });
  }

  undoChanges() {
    const self = this;
    self.setState({ updatedSettings: self.props.settings });
    if (self.props.dialog) {
      self.props.closeDialog();
    }
  }

  saveSettings() {
    const self = this;
    return self.props.saveGlobalSettings(self.state.updatedSettings, false, true).then(() => {
      if (self.props.dialog) {
        self.props.closeDialog();
      }
    });
  }

  render() {
    const { attributes, dialog, docsVersion, settings } = this.props;
    const changed = !deepCompare(this.props.settings, this.state.updatedSettings);
    const value = this.state.updatedSettings.id_attribute || settings.id_attribute || '';
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        {!dialog && (
          <>
            <h2 style={{ marginTop: '15px' }}>Global settings</h2>
            <p className="info" style={{ marginBottom: '30px' }}>
              <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
              {`These settings apply to all users, so changes made here may affect other users' experience.`}
            </p>
          </>
        )}
        <FormControl>
          <InputLabel shrink id="device-id">
            Device identity attribute
          </InputLabel>
          <Select value={value} onChange={e => this.changeIdAttribute(e.target.value)}>
            {attributes.map((item, index) => (
              <MenuItem key={index} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText className="info">
            <div className="margin-top-small margin-bottom-small">Choose a device identity attribute to use to identify your devices throughout the UI.</div>
            <div className="margin-top-small margin-bottom-small">
              <a href={`https://docs.mender.io/${docsVersion}client-installation/identity`} target="_blank">
                Learn how to add custom identity attributes
              </a>{' '}
              to your devices.
            </div>
          </FormHelperText>
        </FormControl>
        <div className="margin-top-large float-right">
          <Button disabled={!changed && !dialog} onClick={() => this.undoChanges()} style={{ marginRight: '10px' }}>
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

const actionCreators = { getDevicesByStatus, getGlobalSettings, saveGlobalSettings };

const mapStateToProps = state => {
  const attributes = state.devices.filteringAttributes.identityAttributes.slice(0, state.devices.filteringAttributesLimit);
  const id_attributes = attributes.reduce(
    (accu, value) => {
      accu.push({ value, label: value });
      return accu;
    },
    [{ value: 'Device ID', label: 'Device ID' }]
  );
  return {
    // limit the selection of the available attribute to AVAILABLE_ATTRIBUTE_LIMIT
    attributes: id_attributes,
    devicesCount: Object.keys(state.devices.byId).length,
    docsVersion: getDocsVersion(state),
    settings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(Global);
