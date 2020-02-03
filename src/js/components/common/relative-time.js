import React from 'react';
import moment from 'moment';
import Time from 'react-time';
import { Tooltip } from '@material-ui/core';
moment.relativeTimeThreshold('ss', 0);

const cutoff = -5 * 60;

export default class RelativeTime extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      updateTime: props.updateTime ? moment(props.updateTime) : null
    };
  }

  componentDidUpdate(prevProps) {
    if ((!this.state.updateTime && this.props.updateTime) || prevProps.updateTime !== this.props.updateTime) {
      this.setState({ updateTime: this.props.updateTime ? moment(this.props.updateTime) : null });
    }
  }

  render() {
    const { updateTime } = this.state;
    const { className } = this.props;
    let timeDisplay = updateTime ? <Time className={className} value={updateTime} format="YYYY-MM-DD HH:mm" /> : <div className={className}>-</div>;
    if (updateTime && updateTime.diff(new Date(), 'seconds') > cutoff) {
      timeDisplay = (
        <time className={className} dateTime={updateTime}>
          {updateTime.fromNow()}
        </time>
      );
    }
    return (
      <Tooltip title={updateTime ? updateTime.toLocaleString() : ''} arrow={true} enterDelay={500}>
        {timeDisplay}
      </Tooltip>
    );
  }
}
