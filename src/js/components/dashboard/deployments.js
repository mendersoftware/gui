import React from 'react';
import { Link } from 'react-router-dom';
import Progress from './progress';
import Recent from './recent';

// material ui
import RaisedButton from 'material-ui/RaisedButton';

export default class Deployments extends React.Component {
  render() {
    return (
      <div className="deployments">
        <div>
          <div className="margin-bottom">
            <Progress loading={this.props.loadingActive} deployments={this.props.progress} />
          </div>
          <div className="margin-bottom">
            <Recent loading={this.props.loadingRecent} deployments={this.props.recent} />
          </div>
        </div>

        <Link to="/deployments?open=true">
          <RaisedButton label="Create a deployment" secondary={true} />
        </Link>
      </div>
    );
  }
}
