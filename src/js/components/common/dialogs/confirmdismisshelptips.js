import React from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import helptooltips from '../../../../assets/img/helptooltips.png';
import { setOnboardingCanceled, setShowDismissOnboardingTipsDialog } from '../../../actions/onboardingActions';

export const ConfirmDismissHelptips = ({ setOnboardingCanceled, setShowDismissOnboardingTipsDialog }) => (
  <Dialog open={true}>
    <DialogTitle>Dismiss the Getting Started help?</DialogTitle>
    <DialogContent>
      <p>Hide the help tips? You haven&apos;t finished your first update yet.</p>
      <p>You can always show the help again later by selecting the option from the top menu:</p>
      <div className="flexbox centered">
        <img src={helptooltips} />
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowDismissOnboardingTipsDialog(false)}>Cancel</Button>
      <div style={{ flexGrow: 1 }} />
      <Button variant="contained" color="secondary" onClick={setOnboardingCanceled}>
        Yes, hide the help
      </Button>
    </DialogActions>
  </Dialog>
);

const actionCreators = { setOnboardingCanceled, setShowDismissOnboardingTipsDialog };

export default connect(null, actionCreators)(ConfirmDismissHelptips);
