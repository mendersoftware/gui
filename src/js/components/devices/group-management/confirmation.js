import React from 'react';
import pluralize from 'pluralize';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { ErrorOutline as ErrorOutlineIcon } from '@material-ui/icons';
import { fullyDecodeURI } from '../../../helpers';

const errorIconStyle = { marginRight: 4, fontSize: 18, top: 4, verticalAlign: 'sub' };

const Confirmation = ({ className, isModification, newGroup, onConfirm, selectedDevices, selectedGroup, willBeEmpty }) => (
  <div className="help-message">
    {isModification ? (
      <p className="info">
        {selectedGroup ? (
          <>
            <ErrorOutlineIcon style={errorIconStyle} />
            {selectedDevices.length} {pluralize('devices', selectedDevices.length)} will be removed from {<i>{fullyDecodeURI(selectedGroup)}</i>} and added to{' '}
            <i>{newGroup}</i>.
          </>
        ) : (
          <>
            <ErrorOutlineIcon style={errorIconStyle} />
            If a device is already in another group, it will be removed from that group and moved to <i>{newGroup}</i>.
          </>
        )}
      </p>
    ) : (
      <>
        <h2>
          <ErrorOutlineIcon style={{ marginRight: 4, verticalAlign: 'sub' }} /> You&apos;re creating a new group
        </h2>
        <p>
          Just a heads-up: If a device is already in another group, it will be removed from that group and moved to <i>{newGroup}</i>. A device can only belong
          to one group at a time.
        </p>
        <FormControlLabel
          className={className}
          control={<Checkbox onChange={(e, checked) => onConfirm(checked)} />}
          label="Got it! Don't show this message again"
          style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.6)' }}
        />
      </>
    )}
    {willBeEmpty && (
      <p className="info">
        <ErrorOutlineIcon style={{ ...errorIconStyle, color: 'rgb(171, 16, 0)' }} />
        After moving the {pluralize('devices', selectedDevices)}, <i>{fullyDecodeURI(selectedGroup)}</i> will be empty and so will be removed.
      </p>
    )}
  </div>
);

export default Confirmation;
