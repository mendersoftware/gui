import React from 'react';
import { Link } from 'react-router-dom';
import Progress from './progress';
import Recent from './recent';

// material ui
import Button from '@material-ui/core/Button';

export default class Deployments extends React.Component {
  render() {
    return (
      <div className="deployments">
        <div>
          <Progress className="margin-bottom" loading={this.props.loadingActive} deployments={this.props.progress} />
          <Recent className="margin-bottom" loading={this.props.loadingRecent} deployments={this.props.recent} />
        </div>

        <Button component={Link} variant="contained" secondary="true" to="/deployments?open=true">
          Create a deployment
        </Button>
      </div>
    );
  }
}
