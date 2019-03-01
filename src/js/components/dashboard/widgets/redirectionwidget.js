import React from 'react';
import { Link } from 'react-router';

// material ui
import RaisedButton from 'material-ui/RaisedButton';

export default class RedirectionWidget extends React.PureComponent {
  filteredClick(event) {
    if (!(event.target.closest('button') && event.target.closest('button').contains(event.target))) {
      this.props.onClick();
    }
  }

  render() {
    return (
      <div className="onboard widget" onClick={event => this.filteredClick(event)}>
        <div>
          <p className={this.props.isActive ? '' : 'muted'}>{this.props.content}</p>
        </div>
        <Link to={this.props.target}>
          <RaisedButton label={this.props.buttonContent} />
        </Link>
      </div>
    );
  }
}
