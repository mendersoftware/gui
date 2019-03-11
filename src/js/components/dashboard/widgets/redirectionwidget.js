import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import Button from '@material-ui/core/Button';

export default class RedirectionWidget extends React.Component {
  render() {
    return (
      <div className="onboard widget" onClick={this.props.onClick}>
        <div>
          <p className={this.props.isActive ? '' : 'muted'}>{this.props.content}</p>
        </div>
        <Button component={Link} to={this.props.target}>
          {this.props.buttonContent}
        </Button>
      </div>
    );
  }
}
