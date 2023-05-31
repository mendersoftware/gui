// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { connect } from 'react-redux';

import { CalendarToday as CalendarTodayIcon, List as ListIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import moment from 'moment';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, setDeploymentsState } from '../../actions/deploymentActions';
import { DEPLOYMENT_STATES } from '../../constants/deploymentConstants';
import { tryMapDeployments } from '../../helpers';
import { getIdAttribute, getIsEnterprise, getUserCapabilities } from '../../selectors';
import { clearAllRetryTimers, clearRetryTimer, setRetryTimer } from '../../utils/retrytimer';
import EnterpriseNotification from '../common/enterpriseNotification';
import { DeploymentDeviceCount, DeploymentEndTime, DeploymentPhases, DeploymentStartTime } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';
import DeploymentsList, { defaultHeaders } from './deploymentslist';

const useStyles = makeStyles()(theme => ({
  inactive: { color: theme.palette.text.disabled },
  refreshIcon: { fill: theme.palette.grey[400], width: 111, height: 111 },
  tabSelect: { textTransform: 'none' }
}));

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

const type = DEPLOYMENT_STATES.scheduled;

export const Scheduled = props => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tabIndex, setTabIndex] = useState(tabs.list.index);
  const timer = useRef();

  const { classes } = useStyles();

  const { abort, canDeploy, createClick, getDeploymentsByStatus, isEnterprise, items, openReport, scheduledState, setDeploymentsState, setSnackbar } = props;
  const { page, perPage } = scheduledState;

  useEffect(() => {
    if (!isEnterprise) {
      return;
    }
    refreshDeployments();
    return () => {
      clearAllRetryTimers(setSnackbar);
    };
  }, [isEnterprise]);

  useEffect(() => {
    if (!isEnterprise) {
      return;
    }
    clearInterval(timer.current);
    timer.current = setInterval(refreshDeployments, refreshDeploymentsLength);
    return () => {
      clearInterval(timer.current);
    };
  }, [isEnterprise, page, perPage]);

  useEffect(() => {
    if (tabIndex !== tabs.calendar.index) {
      return;
    }
    const calendarEvents = items.map(deployment => {
      const start = new Date(deployment.start_ts || deployment.phases ? deployment.phases[0].start_ts : deployment.created);
      let endDate = start;
      if (deployment.phases && deployment.phases.length && deployment.phases[deployment.phases.length - 1].end_ts) {
        endDate = new Date(deployment.phases[deployment.phases.length - 1].end_ts);
      } else if (deployment.filter_id || deployment.filter) {
        // calendar doesn't support never ending events so we arbitrarly set one year
        endDate = moment(start).add(1, 'year');
      }
      return {
        allDay: !(deployment.filter_id || deployment.filter),
        id: deployment.id,
        title: `${deployment.name} ${deployment.artifact_name}`,
        start,
        end: endDate
      };
    });
    setCalendarEvents(calendarEvents);
  }, [tabIndex]);

  const refreshDeployments = useCallback(() => {
    return getDeploymentsByStatus(DEPLOYMENT_STATES.scheduled, page, perPage)
      .then(deploymentsAction => {
        clearRetryTimer(type, setSnackbar);
        const { total, deploymentIds } = deploymentsAction[deploymentsAction.length - 1];
        if (total && !deploymentIds.length) {
          return refreshDeployments();
        }
      })
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, setSnackbar));
  }, [page, perPage]);

  const abortDeployment = id => abort(id).then(refreshDeployments);

  return (
    <div className="fadeIn margin-left">
      {items.length ? (
        <>
          <div className="margin-large margin-left-small">
            {Object.entries(tabs).map(([currentIndex, tab]) => (
              <Button
                className={`${classes.tabSelect} ${currentIndex !== tabIndex ? classes.inactive : ''}`}
                color="primary"
                key={currentIndex}
                startIcon={tab.icon}
                onClick={() => setTabIndex(currentIndex)}
              >
                {tab.title}
              </Button>
            ))}
          </div>
          {tabIndex === tabs.list.index && (
            <DeploymentsList
              {...props}
              abort={abortDeployment}
              headers={headers}
              type={type}
              onChangeRowsPerPage={perPage => setDeploymentsState({ [DEPLOYMENT_STATES.scheduled]: { page: 1, perPage } })}
              onChangePage={page => setDeploymentsState({ [DEPLOYMENT_STATES.scheduled]: { page } })}
            />
          )}
          {tabIndex === tabs.calendar.index && (
            <Calendar
              localizer={localizer}
              className="margin-left margin-bottom"
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              onSelectEvent={calendarEvent => openReport(type, calendarEvent.id)}
            />
          )}
        </>
      ) : (
        <div className="dashboard-placeholder margin-top">
          {isEnterprise ? (
            <>
              <p>Scheduled deployments will appear here. </p>
              {canDeploy && (
                <p>
                  <a onClick={createClick}>Create a deployment</a> to get started
                </p>
              )}
            </>
          ) : (
            <div className="flexbox centered">
              <EnterpriseNotification isEnterprise={isEnterprise} benefit="scheduled deployments to steer the distribution of your updates." />
            </div>
          )}
          <RefreshIcon className={`flip-horizontal ${classes.refreshIcon}`} />
        </div>
      )}
    </div>
  );
};

const actionCreators = { getDeploymentsByStatus, setSnackbar, setDeploymentsState };

const mapStateToProps = state => {
  const scheduled = state.deployments.selectionState.scheduled.selection.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const { plan = 'os' } = state.organization.organization;
  const { canConfigure, canDeploy } = getUserCapabilities(state);
  return {
    canConfigure,
    canDeploy,
    count: state.deployments.byStatus.scheduled.total,
    idAttribute: getIdAttribute(state).attribute,
    // TODO: isEnterprise is misleading here, but is passed down to the DeploymentListItem, this should be renamed
    isEnterprise: getIsEnterprise(state) || plan !== 'os',
    items: scheduled,
    scheduledState: state.deployments.selectionState.scheduled
  };
};

export default connect(mapStateToProps, actionCreators)(Scheduled);
