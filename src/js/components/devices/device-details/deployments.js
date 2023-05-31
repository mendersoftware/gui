// Copyright 2023 Northern.tech AS
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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Table, TableBody, TableCell, TableHead, TableRow, buttonClasses, tableCellClasses } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { deploymentsApiUrl } from '../../../actions/deploymentActions';
import { deploymentDisplayStates, deploymentStatesToSubstates } from '../../../constants/deploymentConstants';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import Confirm from '../../common/confirm';
import InfoHint from '../../common/info-hint';
import Pagination from '../../common/pagination';
import { MaybeTime } from '../../common/time';
import { DeviceStateSelection } from '../authorized-devices';

const useStyles = makeStyles()(theme => ({
  deletion: { justifyContent: 'flex-end' },
  table: {
    minHeight: '10vh',
    [`.deleted > .${tableCellClasses.root}, .deleted a`]: {
      background: theme.palette.background.lightgrey,
      color: theme.palette.grey[700],
      [`.${buttonClasses.root}`]: { color: theme.palette.text.primary }
    }
  }
}));

const EmptyState = ({ isFiltered }) => (
  <div className="flexbox column centered margin-large">
    <p className="align-center muted">
      No deployments were found.
      <br />
      {isFiltered && <>Try adjusting the filters</>}
    </p>
  </div>
);

const columns = [
  { content: 'Release', key: 'release', Component: ({ deviceDeployment: { release } }) => <Link to={`/releases?name=${release}`}>{release}</Link> },
  {
    content: 'Target device(s)',
    key: 'target',
    Component: ({ deviceDeployment: { id, target, route } }) => <Link to={`/deployments/${route}?id=${id}&open=true`}>{target}</Link>
  },
  { content: 'Started', key: 'created', Component: ({ deviceDeployment: { created } }) => <MaybeTime value={created} /> },
  { content: 'Finished', key: 'finished', Component: ({ deviceDeployment: { finished } }) => <MaybeTime value={finished} /> },
  {
    content: 'Deployment progress',
    key: 'deploymentStatus',
    Component: ({ deviceDeployment: { deploymentStatus } }) => deploymentDisplayStates[deploymentStatus] ?? deploymentStatus
  },
  { content: 'Device status', key: 'status', Component: ({ deviceDeployment: { status } }) => status },
  {
    content: '',
    key: 'log',
    Component: ({ deviceDeployment: { id, log, deviceId } }) =>
      log && (
        <Button component="a" href={`${window.location.origin}${deploymentsApiUrl}/deployments/${id}/devices/${deviceId}/log`} target="_blank">
          Log
        </Button>
      )
  }
];

const History = ({ className, items, page, perPage, setPage, setPerPage, total }) => {
  const onChangeRowsPerPage = perPage => {
    setPage(1);
    setPerPage(perPage);
  };
  const wasReset = items.reduce((accu, { deleted }) => {
    if (!accu) {
      return !!deleted;
    }
    return accu;
  }, false);
  return (
    <div className={className}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(({ content, key }) => (
              <TableCell key={key}>{content}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <TableRow className={item.deleted ? 'deleted' : ''} key={item.id}>
              {columns.map(({ key, Component }) => (
                <TableCell key={`${item.id}-${key}`}>
                  <Component deviceDeployment={item} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flexbox space-between">
        <Pagination
          count={total}
          onChangePage={setPage}
          onChangeRowsPerPage={onChangeRowsPerPage}
          page={page}
          rowsPerPage={perPage}
          rowsPerPageOptions={[10, 20]}
        />
        {wasReset && <InfoHint content="Greyed out items will not be considered during deployment roll out" style={{ alignSelf: 'flex-end' }} />}
      </div>
    </div>
  );
};

const deploymentStates = {
  any: { key: 'any', title: () => 'any', values: [] },
  pending: { key: 'pending', title: () => 'pending', values: deploymentStatesToSubstates.pending },
  inprogress: { key: 'inprogress', title: () => 'in progress', values: deploymentStatesToSubstates.inprogress },
  paused: { key: 'paused', title: () => 'paused', values: deploymentStatesToSubstates.paused },
  failures: { key: 'failures', title: () => 'failures', values: deploymentStatesToSubstates.failures },
  successes: { key: 'successes', title: () => 'successes', values: deploymentStatesToSubstates.successes }
};

export const Deployments = ({ device, getDeviceDeployments, resetDeviceDeployments }) => {
  const [filters, setFilters] = useState([deploymentStates.any.key]);
  const [page, setPage] = useState(DEVICE_LIST_DEFAULTS.page);
  const [perPage, setPerPage] = useState(10);
  const [isChecking, setIsChecking] = useState(false);
  const { classes } = useStyles();

  useEffect(() => {
    if (!device?.id) {
      return;
    }
    const filterSelection = deploymentStates[filters[0]].values;
    getDeviceDeployments(device.id, { filterSelection, page, perPage });
  }, [device.id, filters, page, perPage]);

  const onSelectStatus = status => setFilters([status]);

  const onResetStart = () => setIsChecking(true);

  const onResetConfirm = () => resetDeviceDeployments(device.id).then(() => setIsChecking(false));

  const { deviceDeployments = [], deploymentsCount } = device;

  return (
    <div className="margin-bottom">
      <h4 className="margin-bottom-small">Deployments</h4>
      <div className="flexbox margin-bottom-small" style={{ alignSelf: 'flex-start' }}>
        <DeviceStateSelection onStateChange={onSelectStatus} selectedState={filters[0]} states={deploymentStates} />
      </div>

      {!deviceDeployments.length ? (
        <EmptyState isFiltered={filters[0] !== deploymentStates.any.key} />
      ) : (
        <>
          <History
            className={classes.table}
            items={deviceDeployments}
            page={page}
            perPage={perPage}
            setPage={setPage}
            setPerPage={setPerPage}
            total={deploymentsCount}
          />
          <div className={`flexbox margin-top relative ${classes.deletion}`}>
            {isChecking && (
              <Confirm
                classes="confirmation-overlay"
                cancel={() => setIsChecking(false)}
                action={onResetConfirm}
                message={`This will reset the stored device deployment history for this device. Are you sure?`}
                style={{ marginRight: 0 }}
              />
            )}
            <Button onClick={onResetStart} variant="contained">
              Reset device deployment history
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Deployments;
