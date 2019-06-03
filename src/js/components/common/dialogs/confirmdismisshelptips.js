import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import AppActions from '../../../actions/app-actions';

export default class ConfirmDismissHelptips extends React.Component {
  onClose() {
    AppActions.setShowOnboardingHelp(false);
    AppActions.setShowDismissOnboardingTipsDialog(false);
  }
  render() {
    return (
      <Dialog open={this.props.open}>
        <DialogTitle>Dismiss the Getting Started help?</DialogTitle>
        <DialogContent>
          <p>Hide the help tips? You haven&apos;t finished your first update yet.</p>
          <p>You can always show the help again later by selecting the option from the top menu:</p>
          <div className="flexbox centered">
            <img src="assets/img/helptooltips.png" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => AppActions.setShowDismissOnboardingTipsDialog(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={() => this.onClose()}>
            Yes, hide the help
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
