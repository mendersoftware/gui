import React from 'react';
import moment from 'moment';
import Time from 'react-time';
import { Tooltip } from '@material-ui/core';
import LocaleFormatString from './timeformat';

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
    const { className, shouldCount = 'both' } = this.props;

    let timeDisplay = updateTime ? <Time className={className} value={updateTime} format={LocaleFormatString()} /> : <div className={className}>-</div>;
    const diffSeconds = updateTime ? updateTime.diff(moment(), 'seconds') : 0;
    if (
      updateTime &&
      diffSeconds > cutoff &&
      (shouldCount === 'both' || (shouldCount === 'up' && diffSeconds > 0) || (shouldCount === 'down' && diffSeconds < 0))
    ) {
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
