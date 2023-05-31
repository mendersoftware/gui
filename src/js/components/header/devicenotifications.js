// Copyright 2017 Northern.tech AS
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
import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import { DeveloperBoard as DeveloperBoardIcon } from '@mui/icons-material';

import pluralize from 'pluralize';

import { MenderTooltipClickable } from '../common/mendertooltip';

const DeviceNotifications = ({ total, limit, pending }) => {
  const approaching = limit && total / limit > 0.8;
  const warning = limit && limit <= total;
  const content = (
    <>
      <Link to="/devices" className={warning ? 'warning' : approaching ? 'approaching' : ''}>
        <span>{total.toLocaleString()}</span>
        {limit ? <span id="limit">/{limit.toLocaleString()}</span> : null}

        <DeveloperBoardIcon style={{ margin: '0 7px 0 10px', fontSize: 20 }} />
      </Link>
      {pending ? (
        <Link to="/devices/pending" style={{ marginLeft: '7px' }} className={limit && limit < pending + total ? 'warning' : undefined}>
          {pending.toLocaleString()} pending
        </Link>
      ) : null}
    </>
  );
  if (!limit) {
    return <div className="header-section">{content}</div>;
  }
  return (
    <MenderTooltipClickable
      className="header-section"
      disabled={!limit}
      disableHoverListener={false}
      enterDelay={500}
      title={
        <>
          <h3>Device limit</h3>
          {approaching || warning ? (
            <p>You {approaching ? <span>are nearing</span> : <span>have reached</span>} your device limit.</p>
          ) : (
            <p>
              You can still connect another {(limit - total).toLocaleString()} {pluralize('devices', limit - total)}.
            </p>
          )}
          <p>
            If you need a higher device limit, you can contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to change your plan.
          </p>
          <p>
            Learn about the different plans available by visiting{' '}
            <a href="https://mender.io/pricing" target="_blank" rel="noopener noreferrer">
              mender.io/pricing
            </a>
          </p>
        </>
      }
    >
      {content}
    </MenderTooltipClickable>
  );
};
export default DeviceNotifications;
