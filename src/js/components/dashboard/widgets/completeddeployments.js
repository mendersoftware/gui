import React from 'react';

// material ui
import { BaseWidget } from './baseWidget';

export default class CompletedDeployments extends React.PureComponent {
  render() {
    const isActive = this.props.deployments.length;
    const widgetMain = {
      header: `completed`,
      counter: this.props.deployments.length,
      targetLabel: 'View reports'
    };
    return <BaseWidget {...this.props} isActive={isActive} main={widgetMain} onClick={() => this.props.onClick({ route: 'deployments/active' })} />;
  }
}
