import React, { useEffect, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { connect } from 'react-redux';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@mui/material';
import { CalendarToday as CalendarTodayIcon, List as ListIcon, Refresh as RefreshIcon } from '@mui/icons-material';

import { setSnackbar } from '../../actions/appActions';
import { getDeploymentsByStatus, selectDeployment, setDeploymentsState } from '../../actions/deploymentActions';
import { DEPLOYMENT_STATES } from '../../constants/deploymentConstants';
import { tryMapDeployments } from '../../helpers';
import { getIsEnterprise, getUserCapabilities } from '../../selectors';
import { colors } from '../../themes/Mender';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import EnterpriseNotification from '../common/enterpriseNotification';
import DeploymentsList, { defaultHeaders } from './deploymentslist';
import { DeploymentDeviceCount, DeploymentEndTime, DeploymentPhases, DeploymentStartTime } from './deploymentitem';
import { defaultRefreshDeploymentsLength as refreshDeploymentsLength } from './deployments';

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

  const { abort, canDeploy, createClick, getDeploymentsByStatus, isEnterprise, items, openReport, scheduledState, setDeploymentsState, setSnackbar } = props;
  const { page, perPage, total: count } = scheduledState;

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

  const refreshDeployments = (changedPage = page, changedPerPage = perPage) => {
    setDeploymentsState({ [DEPLOYMENT_STATES.scheduled]: { page: changedPage, perPage: changedPerPage } });
    return getDeploymentsByStatus(DEPLOYMENT_STATES.scheduled, changedPage, changedPerPage)
      .then(deploymentsAction => {
        clearRetryTimer(type, setSnackbar);
        const { total, deploymentIds } = deploymentsAction[deploymentsAction.length - 1];
        if (total && !deploymentIds.length) {
          return refreshDeployments(changedPage, changedPerPage);
        }
      })
      .catch(err => setRetryTimer(err, 'deployments', `Couldn't load deployments.`, refreshDeploymentsLength, setSnackbar));
  };

  const abortDeployment = id => abort(id).then(refreshDeployments);

  return (
    <div className="fadeIn margin-left">
      {items.length ? (
        <>
          <div className="margin-large margin-left-small">
            {Object.entries(tabs).map(([currentIndex, tab]) => (
              <Button
                color="primary"
                key={currentIndex}
                startIcon={tab.icon}
                style={Object.assign({ textTransform: 'none' }, currentIndex !== tabIndex ? { color: colors.grey } : {})}
                onClick={() => setTabIndex(currentIndex)}
              >
                {tab.title}
              </Button>
            ))}
          </div>
          {tabIndex === tabs.list.index && <DeploymentsList {...props} abort={abortDeployment} count={count} headers={headers} type={type} />}
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
          <RefreshIcon style={{ transform: 'rotateY(-180deg)', fill: '#e3e3e3', width: 111, height: 111 }} />
        </div>
      )}
    </div>
  );
};

const actionCreators = { getDeploymentsByStatus, setSnackbar, setDeploymentsState, selectDeployment };

const mapStateToProps = state => {
  const scheduled = state.deployments.selectionState.scheduled.selection.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const { plan = 'os' } = state.organization.organization;
  const { canDeploy } = getUserCapabilities(state);
  return {
    canDeploy,
    // TODO: isEnterprise is misleading here, but is passed down to the DeploymentListItem, this should be renamed
    isEnterprise: getIsEnterprise(state) || plan !== 'os',
    items: scheduled,
    scheduledState: state.deployments.selectionState.scheduled
  };
};

export default connect(mapStateToProps, actionCreators)(Scheduled);
