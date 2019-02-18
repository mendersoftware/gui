import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';
import validator from 'validator';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Icon from '@material-ui/core/Icon';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

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
    this.setState({ showInput: true, customName: '' });
    this.props.changeSelect('');
    this.refs.customGroup.focus();
    this.props.validateName(true, '');
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
        errorText1: null
      });
    }
  }
  _handleGroupNameChange(event) {
    this.setState({ groupName: event.target.value });
    this._validateName(event.target.value);
  }
  _validateName(name) {
    name = fullyDecodeURI(name);
    var errorText = null;
    var invalid = false;
    if (name && !validator.isWhitelisted(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
      invalid = true;
      errorText = 'Valid characters are a-z, A-Z, 0-9, _ and -';
    } else if (name) {
      for (var i = 0; i < this.props.groups.length; i++) {
        if (fullyDecodeURI(this.props.groups[i]) === name) {
          errorText = 'A group with this name already exists';
          invalid = true;
        }
      }
    } else {
      errorText = 'Name cannot be left blank';
      invalid = true;
    }
    this.setState({ errorText1: errorText, invalid: invalid });
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
          <MenuItem component={Link} to={group} key={index}>
            {decodeURIComponent(group)}
          </MenuItem>
        );
      }
    });

    var newGroup = fullyDecodeURI(this.props.selectedField || fullyDecodeURI(this.props.tmpGroup));
    var showSelect = self.props.selectedGroup ? this.props.groups.length - 1 : this.props.groups.length;

    return (
      <div style={{ height: '200px' }}>
        <div className={showSelect ? 'float-left' : 'hidden'}>
          <FormControl className="float-left">
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

          <div className="float-left margin-left-small">
            <Button variant="contained" style={{ marginTop: '26px' }} onClick={() => this._showButton()}>
              Create new
            </Button>
          </div>
        </div>

        <div className={this.state.showInput || !showSelect ? null : 'hidden'}>
          <TextField
            ref="customGroup"
            value={this.state.customName || ''}
            placeholder="Name of new group"
            label="Name of new group"
            className="float-left clear"
            onChange={event => this._handleTextFieldChange(event.target.value)}
            errorStyle={{ color: 'rgb(171, 16, 0)' }}
            errorText={this.state.errorText1}
          />
        </div>

        <div className="block float-left clear">
          <p className={newGroup ? 'info' : 'hidden'}>
            {this.props.selectedGroup ? (
              <span>
                <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px' }}>
                  error_outline
                </Icon>
                {this.props.devices} {pluralize('devices', this.props.devices)} will be removed from <i>{fullyDecodeURI(this.props.selectedGroupName)}</i> and
                added to <i>{newGroup}</i>.
              </span>
            ) : (
              <span>
                <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px' }}>
                  error_outline
                </Icon>
                If a device is already in another group, it will be removed from that group and moved to <i>{newGroup}</i>.
              </span>
            )}
          </p>

          {this.props.willBeEmpty ? (
            <p className="info">
              <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                error_outline
              </Icon>
              After moving the {pluralize('devices', this.props.devices)}, <i>{fullyDecodeURI(this.props.selectedGroup)}</i> will be empty and so will be
              removed.
            </p>
          ) : null}
        </div>
      </div>
    );
  }
}
