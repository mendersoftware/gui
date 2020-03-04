import React from 'react';
import { connect } from 'react-redux';
import SoftwareDistribution from '../dashboard/widgets/software-distribution';

export class Reports extends React.PureComponent {
  render() {
    const { devices } = this.props;
    return (
      <div className="dashboard">
        <SoftwareDistribution devices={devices} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    devices: state.devices.byId
  };
};

export default connect(mapStateToProps)(Reports);
