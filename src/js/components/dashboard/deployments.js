import React from 'react';

import Progress from './progress';
import Recent from './recent';

// material ui
import RaisedButton from 'material-ui/RaisedButton';

export default class Deployments extends React.Component {
  _clickHandle(params) {
    this.props.clickHandle(params);
  }
  render() {
    return (
      <div className="deployments">
        <div>
          <div className="margin-bottom">
            <Progress
              globalSettings={this.props.globalSettings}
              loading={this.props.loadingActive}
              clickHandle={params => this._clickHandle(params)}
              deployments={this.props.progress}
            />
          </div>
          <div className="margin-bottom">
            <Recent loading={this.props.loadingRecent} clickHandle={params => this._clickHandle(params)} deployments={this.props.recent} />
          </div>
        </div>

        <div>
          <RaisedButton onClick={() => this._clickHandle({ route: 'deployments', open: true })} label="Create a deployment" secondary={true} />
        </div>
      </div>
    );
  }
}
