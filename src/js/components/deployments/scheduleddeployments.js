import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@material-ui/core';
import { CalendarToday as CalendarTodayIcon, List as ListIcon } from '@material-ui/icons';

import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentDeviceCount, DeploymentEndTime, DeploymentPhases, DeploymentStartTime, DeploymentWindows } from './deploymentitem';

const localizer = momentLocalizer(moment);

const headers = [
  ...defaultHeaders.slice(0, 2),
  { title: 'Start time', renderer: DeploymentStartTime, props: { direction: 'up' } },
  { title: `End time`, renderer: DeploymentEndTime },
  { title: '# devices', class: 'align-right', renderer: DeploymentDeviceCount },
  { title: 'Scheduled windows', renderer: DeploymentWindows },
  { title: 'Phases', renderer: DeploymentPhases }
];

export class Scheduled extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: 'list'
    };
  }

  render() {
    const self = this;
    const { tabIndex } = self.state;
    return (
      <div className="fadeIn margin-left">
        <div className="margin-large margin-left-small">
          <Button color="secondary" startIcon={<ListIcon />} style={{ textTransform: 'none' }} onClick={() => self.setState({ tabIndex: 'list' })}>
            List view
          </Button>
          <Button color="primary" startIcon={<CalendarTodayIcon />} style={{ textTransform: 'none' }} onClick={() => self.setState({ tabIndex: 'calendar' })}>
            Calendar
          </Button>
        </div>
        {tabIndex === 'list' && <DeploymentsList headers={headers} {...self.props} type="scheduled" />}
        {tabIndex === 'calendar' && <Calendar localizer={localizer} events={[]} startAccessor="start" endAccessor="end" style={{ height: 500 }} />}
      </div>
    );
  }
}

export default Scheduled;
