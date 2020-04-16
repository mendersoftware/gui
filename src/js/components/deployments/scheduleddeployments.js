import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

import { Tab, Tabs } from '@material-ui/core';

import DeploymentsList, { defaultHeaders } from './deploymentslist';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

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
      <div>
        <Tabs className="margin-bottom-large" value={tabIndex} onChange={(e, tabIndex) => self.setState({ tabIndex })}>
          <Tab label="List view" value="list" />
          <Tab label="Calendar" value="calendar" />
        </Tabs>

        {tabIndex === 'list' && <DeploymentsList headers={defaultHeaders} items={[]} {...self.props} />}
        {tabIndex === 'calendar' && <Calendar localizer={localizer} events={[]} startAccessor="start" endAccessor="end" style={{ height: 500 }} />}
      </div>
    );
  }
}

export default Scheduled;
