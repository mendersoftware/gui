import React from 'react';
import pluralize from 'pluralize';
import validator from 'validator';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import AppActions from '../../actions/app-actions';
import { fullyDecodeURI } from '../../helpers';

export default class GroupSelector extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showInput: false,
      invalid: true
    };
  }

  componentDidMount() {
    this.changeTimer;
  }

  _showButton() {
    const self = this;
    self.setState({ showInput: true, customName: '' }, () => self.customGroup.focus());
    self.props.changeSelect('');
    self.props.validateName(true, '');
  }

  _handleGroupNameSave(event) {
    if (!event || event['keyCode'] === 13) {
      if (!this.state.errorCode1) {
        var group = this.props.selectedGroup;
        group = this.state.groupName;
        AppActions.addToGroup(group, []);
      } else {
        this.setState({ groupName: this.props.selectedGroup });
      }
    }
    if (event && event['keyCode'] === 13) {
      this.setState({
        nameEdit: false,
        errortext1: null
      });
    }
  }
  _handleGroupNameChange(event) {
    this.setState({ groupName: event.target.value });
    this._validateName(event.target.value);
  }
  _validateName(name) {
    name = fullyDecodeURI(name);
    var errortext = null;
    var invalid = false;
    if (name && !validator.isWhitelisted(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
      invalid = true;
      errortext = 'Valid characters are a-z, A-Z, 0-9, _ and -';
    } else if (name) {
      for (var i = 0; i < this.props.groups.length; i++) {
        if (fullyDecodeURI(this.props.groups[i]) === name) {
          errortext = 'A group with this name already exists';
          invalid = true;
        }
      }
    } else {
      errortext = 'Name cannot be left blank';
      invalid = true;
    }
    this.setState({ errortext1: errortext, invalid: invalid });
    this.props.validateName(invalid, name);
  }
  _onChange(event) {
    this._validateName(event.target.value);
  }
  _handleTextFieldChange(value) {
    this.setState({ customName: value });
    this._validateName(value);
  }
  _handleSelectValueChange(value) {
    this.setState({ showInput: false, groupName: '' });
    this.props.changeSelect(value);
    this.props.validateName(false);
  }

  render() {
    var self = this;
    var groupList = this.props.groups.map((group, index) => {
      if (group && group !== self.props.selectedGroup) {
        // don't show the current selected group in the list
        return (
          <MenuItem key={index} value={group}>
            {decodeURIComponent(group)}
          </MenuItem>
        );
      }
    });

    var newGroup = fullyDecodeURI(this.props.selectedField || fullyDecodeURI(this.props.tmpGroup));
    var showSelect = self.props.selectedGroup ? this.props.groups.length - 1 : this.props.groups.length;

    return (
      <div style={{ height: '200px' }}>
        {showSelect ? (
          <Grid container spacing={2} className="float-left">
            <Grid item>
              <FormControl>
                <InputLabel htmlFor="group-select">Select group</InputLabel>
                <Select
                  onChange={event => this._handleSelectValueChange(event.target.value)}
                  value={this.props.selectedField || ''}
                  inputProps={{
                    name: 'groupSelect',
                    id: 'group-select'
                  }}
                >
                  {groupList}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button className="margin-left-small" variant="contained" style={{ marginTop: '26px' }} onClick={() => this._showButton()}>
                Create new
              </Button>
            </Grid>
          </Grid>
        ) : null}

        {this.state.showInput || !showSelect ? (
          <FormControl error={Boolean(self.state.errortext1)}>
            <InputLabel htmlFor="group-name-input">Name of new group</InputLabel>
            <Input
              id="group-name-input"
              className="float-left clear"
              inputRef={input => (self.customGroup = input)}
              value={this.state.customName || ''}
              placeholder="Name of new group"
              onChange={event => this._handleTextFieldChange(event.target.value)}
              type="text"
            />
            <FormHelperText>{self.state.errortext1}</FormHelperText>
          </FormControl>
        ) : null}

        <div className="block float-left clear">
          {newGroup ? (
            <p className="info">
              {this.props.selectedGroup ? (
                <span>
                  <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px' }} />
                  {this.props.devices} {pluralize('devices', this.props.devices)} will be removed from <i>{fullyDecodeURI(this.props.selectedGroupName)}</i> and
                  added to <i>{newGroup}</i>.
                </span>
              ) : (
                <span>
                  <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px' }} />
                  If a device is already in another group, it will be removed from that group and moved to <i>{newGroup}</i>.
                </span>
              )}
            </p>
          ) : null}

          {this.props.willBeEmpty ? (
            <p className="info">
              <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
              After moving the {pluralize('devices', this.props.devices)}, <i>{fullyDecodeURI(this.props.selectedGroup)}</i> will be empty and so will be
              removed.
            </p>
          ) : null}
        </div>
      </div>
    );
  }
}
