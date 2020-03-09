import React from 'react';

import { IconButton, Paper } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { VictoryChart, VictoryLine } from 'victory';

import Loader from '../common/loader';

export default class DistributionReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    const data = Object.values(this.props.devices)
      .sort((a, b) => new Date(a.created_ts) - new Date(b.created_ts))
      .reduce((accu, item, index) => {
        accu.push({ x: new Date(item.created_ts), y: index });
        return accu;
      }, []);
    this.setState({ data });
  }

  render() {
    const { data } = this.state;
    const { onClick } = this.props;
    return (
      <Paper className="flexbox column centered space-between margin-right margin-bottom" elevation={2} style={{ minWidth: 380, width: 380 }}>
        {data.length ? (
          <>
            <IconButton onClick={onClick} style={{ alignSelf: 'flex-end' }}>
              <ClearIcon fontSize="small" />
            </IconButton>
            <VictoryChart scale={{ x: 'time' }}>
              <VictoryLine data={data} height={220} width={220} />
            </VictoryChart>
            <h4 style={{ fontSize: 16 }}>new devices over time</h4>
          </>
        ) : (
          <Loader show={true} />
        )}
      </Paper>
    );
  }
}
