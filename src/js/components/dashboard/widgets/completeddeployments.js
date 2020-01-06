import React from 'react';
import Time from 'react-time';

// material ui
import { BaseWidget } from './baseWidget';

export default class CompletedDeployments extends React.PureComponent {
  render() {
    const headerStyle = {
      alignItems: 'center',
      justifyContent: 'flex-end'
    };

    const counter = this.props.deployments.reduce((accu, item) => (new Date(item.finished) > this.props.cutoffDate ? accu + 1 : accu), 0);
    const widgetMain = {
      header: (
        <div className="flexbox" style={headerStyle}>
          <div style={{ fontSize: 36, marginRight: '1vw' }}>{counter}</div>
          <div>completed</div>
        </div>
      ),
      counter: (
        <div className="completionInfo">
          <div>since last login on</div>
          <Time value={this.props.cutoffDate} format="YYYY-MM-DD" />
        </div>
      ),
      targetLabel: 'View reports'
    };
    const cutoffDay = this.props.cutoffDate.toISOString();
    const route = `deployments/finished?from=${cutoffDay.slice(0, cutoffDay.indexOf('T'))}`;
    return counter > 0 && <BaseWidget {...this.props} isActive={true} main={widgetMain} onClick={() => this.props.onClick({ route })} />;
  }
}
