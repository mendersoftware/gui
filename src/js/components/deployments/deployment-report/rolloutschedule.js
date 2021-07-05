import React from 'react';
import Time from 'react-time';
import pluralize from 'pluralize';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { Chip } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';

import { formatTime, getPhaseDeviceCount, getRemainderPercent, groupDeploymentStats } from '../../../helpers';
import theme, { colors } from '../../../themes/mender-theme';
import { TwoColumnData } from '../../common/configurationobject';
import { getPhaseStartTime } from '../createdeployment';
import { ProgressChart } from '../progressChart';
import { defaultColumnDataProps } from '../report';
import { DEPLOYMENT_STATES } from '../../../constants/deploymentConstants';
import PhaseProgress from './phaseprogress';

momentDurationFormatSetup(moment);

const maxPhaseWidth = 270;

export const RolloutSchedule = ({ deployment, innerRef, onAbort, onUpdateControlChange }) => {
  const now = moment();
  const {
    created: creationTime = now.toISOString(),
    device_count: deploymentDeviceCount,
    filter = {},
    finished,
    max_devices,
    phases = [{ batch_size: 100 }],
    status,
    update_control_map
  } = deployment;
  const { id: filterId } = filter;
  const { inprogress: currentProgressCount, successes: totalSuccessCount, failures: totalFailureCount } = groupDeploymentStats(deployment);
  const totalDeviceCount = Math.max(deploymentDeviceCount, max_devices || 0);

  const start_time = phases[0].start_ts || creationTime;
  const currentPhase =
    phases
      .slice()
      .reverse()
      .find(phase => now.isAfter(phase.start_ts)) || phases[0];
  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase.id);
  const currentPhaseStartTime = getPhaseStartTime(phases, currentPhaseIndex, start_time);
  let currentPhaseTime = 'N/A';
  if (now.isSameOrAfter(currentPhaseStartTime)) {
    currentPhaseTime = currentPhaseIndex + 1;
  }
  const endTime = finished ? <Time value={formatTime(finished)} format="YYYY-MM-DD HH:mm" /> : filterId ? 'N/A' : '-';
  return (
    <>
      <h4 className="dashboard-header margin-top-large" ref={innerRef}>
        <span>Schedule details</span>
      </h4>
      {phases.length > 1 || !update_control_map ? (
        <>
          <div className="flexbox">
            <TwoColumnData
              {...defaultColumnDataProps}
              config={{
                'Start time': <Time value={formatTime(creationTime)} format="YYYY-MM-DD HH:mm" />,
                'Current phase': currentPhaseTime
              }}
            />
            <ArrowForward style={{ marginLeft: theme.spacing(4), marginRight: theme.spacing(4) }} />
            <TwoColumnData {...defaultColumnDataProps} config={{ 'End time': endTime }} />
          </div>
          <div className="progress-chart-container margin-top" style={{ background: 'initial' }}>
            <ProgressChart
              currentPhase={currentPhase}
              currentProgressCount={currentProgressCount}
              phases={phases}
              showPhaseNumber
              totalDeviceCount={totalDeviceCount}
              totalFailureCount={totalFailureCount}
              totalSuccessCount={totalSuccessCount}
            />
          </div>
        </>
      ) : (
        <PhaseProgress deployment={deployment} onAbort={onAbort} onUpdateControlChange={onUpdateControlChange} />
      )}
      <div className="deployment-phases-report margin-top margin-bottom" style={{ gridTemplateColumns: `repeat(auto-fit, ${maxPhaseWidth}px)` }}>
        {phases.map((phase, index) => {
          phase.batch_size = phase.batch_size || getRemainderPercent(phases);
          const deviceCount = getPhaseDeviceCount(
            deployment.max_devices || deploymentDeviceCount,
            phase.batch_size,
            phase.batch_size,
            index === phases.length - 1
          );
          const deviceCountText = !filterId ? ` (${deviceCount} ${pluralize('device', deviceCount)})` : '';
          const startTime = phase.start_ts ?? getPhaseStartTime(phases, index, start_time);
          const phaseObject = {
            'Start time': <Time value={startTime} format="YYYY-MM-DD HH:mm" />,
            'Batch size': <div className="text-muted">{`${phase.batch_size}%${deviceCountText}`}</div>
          };
          let phaseTitle = status !== DEPLOYMENT_STATES.scheduled ? <div className="text-muted">Complete</div> : null;
          let backgroundColor = 'initial';
          if (now.isBefore(startTime)) {
            const duration = moment.duration(moment(startTime).diff(now));
            phaseTitle = <div>{`Begins in ${duration.format('d [days] hh [h] mm [m]')}`}</div>;
          } else if (status === DEPLOYMENT_STATES.inprogress && phase.id === currentPhase.id) {
            phaseTitle = <div className="text-muted">Current phase</div>;
            backgroundColor = colors.expansionBackground;
          }
          return (
            <div
              className="flexbox column centered"
              key={startTime}
              style={{ maxWidth: maxPhaseWidth, backgroundColor, borderRadius: 5, paddingTop: theme.spacing(), paddingBottom: theme.spacing(3) }}
            >
              {phaseTitle}
              <Chip size="small" label={`Phase ${index + 1}`} style={{ alignSelf: 'flex-start', margin: theme.spacing(2), marginLeft: theme.spacing(2.5) }} />
              <TwoColumnData {...defaultColumnDataProps} style={{ ...defaultColumnDataProps.style, alignSelf: 'initial' }} config={phaseObject} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RolloutSchedule;
