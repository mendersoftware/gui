import React from 'react';

// material ui
import Button from '@material-ui/core/Button';

export default class ScheduleButton extends React.Component {
  _handleClick() {
    var artifact = null;
    if (this.props.artifact) {
      artifact = this.props.artifact;
    }
    this.props.openDialog('schedule', artifact);
  }
  render() {
    var button = '';
    const label = this.props.label || 'Create a deployment';
    if (this.props.buttonType === 'flat') {
      button = (
        <Button primary={this.props.primary} secondary={this.props.secondary} onClick={() => this._handleClick()}>
          {label}
        </Button>
      );
    } else {
      button = (
        <Button variant="contained" primary={this.props.primary} secondary={this.props.secondary} onClick={() => this._handleClick()}>
          {label}
        </Button>
      );
    }
    return button;
  }
}
