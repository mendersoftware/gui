import React from 'react';
import { Link } from 'react-router';

// material ui
import RaisedButton from 'material-ui/RaisedButton';

export class RedirectionWidget extends React.Component {
  render() {
    return (
      <div style={this.props.itemStyle} className="onboard">
        <div>
          <p>{this.props.content}</p>
        </div>
        <Link to={this.props.target}>
          <RaisedButton label={this.props.buttonContent} />
        </Link>
      </div>
    );
  }
}
