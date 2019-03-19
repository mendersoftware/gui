import React from 'react';
import { Link } from 'react-router';

// material ui
import RaisedButton from 'material-ui/RaisedButton';
import { styles } from './baseWidget';

export class RedirectionWidget extends React.Component {
  render() {
    return (
      <div className="onboard widget" onClick={this.props.onClick}>
        <div>
          <p className={this.props.isActive ? "" : "muted" }>{this.props.content}</p>
        </div>
        <Link to={this.props.target}>
          <RaisedButton label={this.props.buttonContent} />
        </Link>
      </div>
    );
  }
}
