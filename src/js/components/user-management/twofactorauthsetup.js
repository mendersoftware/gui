import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Collapse, Switch } from '@material-ui/core';

import { setSnackbar } from '../../actions/appActions';
import { saveGlobalSettings, verify2FA, verifyEmailComplete, verifyEmailStart } from '../../actions/userActions';
import { twoFAStates } from '../../constants/userConstants';
import { getCurrentUser, getHas2FA, get2FaAccessor } from '../../selectors';

import AuthSetup from './twofactorauth-steps/authsetup';
import EmailVerification from './twofactorauth-steps/emailverification';

export const TwoFactorAuthSetup = ({ currentUser, has2FA, qrImage, saveGlobalSettings, setSnackbar, verify2FA, verifyEmailComplete, verifyEmailStart }) => {
  const [qrExpanded, setQrExpanded] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(has2FA);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    if (currentUser.verified && is2FAEnabled && !has2FA) {
      setShowEmailVerification(false);
      setQrExpanded(true);
    }
  }, [currentUser.verified]);

  const handle2FAState = state => {
    setQrExpanded(state === twoFAStates.unverified);
    setIs2FAEnabled(state !== twoFAStates.disabled);
    saveGlobalSettings({ [`${currentUser.id}_2fa`]: state }).then(() =>
      state === twoFAStates.enabled ? setSnackbar('Two Factor authentication set up successfully.') : null
    );
  };

  const onToggle2FAClick = () => {
    if (!currentUser.verified) {
      setShowEmailVerification(!showEmailVerification);
      setIs2FAEnabled(!showEmailVerification);
      return;
    }
    if (has2FA) {
      handle2FAState(twoFAStates.disabled);
    } else {
      setQrExpanded(!is2FAEnabled);
      setIs2FAEnabled(!is2FAEnabled);
    }
  };

  return (
    <div className="margin-top">
      <div className="clickable flexbox space-between" onClick={onToggle2FAClick}>
        <p className="help-content">Enable Two Factor authentication</p>
        <Switch checked={is2FAEnabled} />
      </div>
      <p className="info" style={{ width: '75%', margin: 0 }}>
        Two Factor Authentication adds a second layer of protection to your account by asking for an additional verification code each time you log in.
      </p>
      {showEmailVerification && <EmailVerification verifyEmailComplete={verifyEmailComplete} verifyEmailStart={verifyEmailStart} />}
      <Collapse in={qrExpanded} timeout="auto" unmountOnExit>
        <AuthSetup
          currentUser={currentUser}
          handle2FAState={handle2FAState}
          has2FA={has2FA}
          saveGlobalSettings={saveGlobalSettings}
          qrImage={qrImage}
          verify2FA={verify2FA}
        />
      </Collapse>
    </div>
  );
};

const actionCreators = { saveGlobalSettings, setSnackbar, verify2FA, verifyEmailComplete, verifyEmailStart };

const mapStateToProps = state => {
  return {
    currentUser: getCurrentUser(state),
    has2FA: getHas2FA(state),
    twoFaAccessor: get2FaAccessor(state),
    previousPhases: state.users.globalSettings.previousPhases,
    qrImage: state.users.qrCode
  };
};

export default connect(mapStateToProps, actionCreators)(TwoFactorAuthSetup);
