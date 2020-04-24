import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@material-ui/core';
import { CalendarToday as CalendarTodayIcon, List as ListIcon } from '@material-ui/icons';

import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentDeviceCount, DeploymentEndTime, DeploymentPhases, DeploymentStartTime } from './deploymentitem';

const localizer = momentLocalizer(moment);

const headers = [
  ...defaultHeaders.slice(0, 2),
  { title: 'Start time', renderer: DeploymentStartTime, props: { direction: 'up' } },
  { title: `End time`, renderer: DeploymentEndTime },
  { title: '# devices', class: 'align-right column-defined', renderer: DeploymentDeviceCount },
  { title: 'Phases', renderer: DeploymentPhases }
];

const tabs = {
  list: {
    icon: <ListIcon />,
    index: 'list',
    title: 'List view'
  },
  calendar: {
    icon: <CalendarTodayIcon />,
    index: 'calendar',
    title: 'Calendar'
  }
};

export class Scheduled extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: tabs.list.index,
      calendarEvents: []
    };
  }

  componentDidUpdate(_, prevState) {
    if (prevState.tabIndex !== this.state.tabIndex && this.state.tabIndex === tabs.calendar.index) {
      const calendarEvents = this.props.items.map(deployment => {
        const start = new Date(deployment.start_ts || deployment.phases ? deployment.phases[0].start_ts : deployment.created);
        let endDate = start;
        if (deployment.phases && deployment.phases.length && deployment.phases[deployment.phases.length - 1].end_ts) {
          endDate = new Date(deployment.phases[deployment.phases.length - 1].end_ts);
        } else if (deployment.filter_id) {
          endDate = new Date(8640000000000000); // set to the upper limit of js supported dates, which should be the next best thing to infinity
        }
        return {
          allDay: !deployment.filter_id,
          id: deployment.id,
          title: `${deployment.name} ${deployment.artifact_name}`,
          start,
          end: endDate
        };
      });
      this.setState({ calendarEvents });
    }
  }

  render() {
    const self = this;
    const { calendarEvents, tabIndex } = self.state;
    const { openReport } = self.props;
    return (
      <div className="fadeIn margin-left">
        <div className="margin-large margin-left-small">
          {Object.entries(tabs).map(([currentIndex, tab]) => (
            <Button
              color="primary"
              key={currentIndex}
              startIcon={tab.icon}
              style={Object.assign({ textTransform: 'none' }, currentIndex !== tabIndex ? { color: '#c7c7c7' } : {})}
              onClick={() => self.setState({ tabIndex: currentIndex })}
            >
              {tab.title}
            </Button>
          ))}
        </div>
        {tabIndex === tabs.list.index && <DeploymentsList headers={headers} {...self.props} type="scheduled" count={0} />}
        {tabIndex === tabs.calendar.index && (
          <Calendar
            localizer={localizer}
            className="margin-left"
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={calendarEvent => openReport('scheduled', calendarEvent.id)}
          />
        )}
      </div>
    );
  }
}

export default Scheduled;
