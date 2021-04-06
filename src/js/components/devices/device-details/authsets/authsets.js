import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

// material ui
import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

import { deleteAuthset, getDeviceAuth, updateDeviceAuth } from '../../../../actions/deviceActions';
import { DEVICE_DISMISSAL_STATE, DEVICE_STATES } from '../../../../constants/deviceConstants';
import { getLimitMaxed } from '../../../../selectors';
import theme from '../../../../themes/mender-theme';
import Confirm from './../../../common/confirm';
import Authsetlist from './authsetlist';
import { customSort } from '../../../../helpers';

export const Authsets = ({ decommission, deleteAuthset, device, deviceListRefresh, getDeviceAuth, limitMaxed, showHelptips, updateDeviceAuth }) => {
  const [confirmDecommission, setConfirmDecomission] = useState(false);
  const [loading, setLoading] = useState(false);
  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  const currentAuthSet = useMemo(() => {
    const { auth_sets = [] } = device;
    const sortedSets = auth_sets.sort(customSort(true, 'ts'));
    return sortedSets.reduce((accu, item) => {
      if (item.status === DEVICE_STATES.accepted) {
        return item;
      }
      return accu;
    }, sortedSets[0]);
  }, [device]);

  const updateDeviceAuthStatus = (device_id, auth_id, status) => {
    setLoading(auth_id);
    const postUpdateSteps = () => {
      deviceListRefresh();
      setLoading(null);
    };

    if (status === DEVICE_DISMISSAL_STATE) {
      return (
        deleteAuthset(device_id, auth_id)
          // on finish, change "loading" back to null
          .finally(postUpdateSteps)
      );
    } else {
      // call API to update authset
      return (
        updateDeviceAuth(device_id, auth_id, status)
          // refresh authset list
          .then(() => getDeviceAuth(device_id))
          // on finish, change "loading" back to null
          .finally(postUpdateSteps)
      );
    }
  };

  return (
    <div style={{ minWidth: 700, marginBottom: theme.spacing(2), backgroundColor: '#f7f7f7', border: '1px solid rgb(224, 224, 224)', padding: '16px' }}>
      <div className="margin-bottom-small">
        {status === DEVICE_STATES.pending ? `Authorization ${pluralize('request', auth_sets.length)}` : 'Authorization sets'}
      </div>
      <Authsetlist
        limitMaxed={limitMaxed}
        total={auth_sets.length}
        confirm={updateDeviceAuthStatus}
        loading={loading}
        device={device}
        showHelptips={showHelptips}
      />
      {limitMaxed && (
        <div className="warning">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          You have reached your limit of authorized devices.
          <p>
            Contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to request a higher limit.
          </p>
        </div>
      )}
      {(device.status === DEVICE_STATES.accepted || device.status === DEVICE_STATES.rejected) && (
        <div className="flexbox" style={{ justifyContent: 'flex-end', marginTop: theme.spacing(2) }}>
          {confirmDecommission ? (
            <Confirm action={() => decommission(device.id, currentAuthSet.id)} cancel={() => setConfirmDecomission(false)} type="decommissioning" />
          ) : (
            <Button color="secondary" onClick={setConfirmDecomission}>
              Decommission device
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const actionCreators = { deleteAuthset, getDeviceAuth, updateDeviceAuth };

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.device.id] || {};
  return {
    device,
    limitMaxed: getLimitMaxed(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Authsets);
