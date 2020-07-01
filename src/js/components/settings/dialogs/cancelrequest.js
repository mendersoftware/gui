import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

const cancelSubscriptionReasons = [
  'Just learning about Mender',
  'Decided to use Mender on-premise',
  'Decided to use a different OTA update manager',
  'Too expensive',
  'Lack of features',
  'Was not able to get my device working properly with Mender',
  'Security concerns',
  'I am using a different hosted Mender account',
  'My project is delayed or cancelled',
  'Other'
];

export class CancelRequestDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      confirm: false,
      cancelSubscriptionReason: '',
      cancelSubscriptionReasonOther: ''
    };
  }

  componentDidMount() {
    this.setState({});
  }

  _confirm() {
    this.setState({ confirm: true });
  }

  _setCancelSubscriptionReason(evt) {
    this.setState({ cancelSubscriptionReason: evt.target.value });
    if (evt.target.value !== 'Other') {
      this.setState({ cancelSubscriptionReasonOther: '' });
    }
  }

  _setCancelSubscriptionReasonOther(evt) {
    this.setState({ cancelSubscriptionReasonOther: evt.target.value });
  }

  render() {
    return (
      <Dialog open={true}>
        <DialogTitle>{!this.state.confirm ? 'Cancel subscription and deactivate account?' : 'Confirm deactivation'}</DialogTitle>
        {!this.state.confirm ? (
          <DialogContent>
            <p className="margin-top-small">
              We&#39;ll be sorry to see you go. If you&#39;re sure you&#39;re ready to deactivate your account please let us know the reason you&#39;re
              canceling, and we&#39;ll start the process.
            </p>
            <p>Please select the reason for your cancellation to help us improve our service:</p>
            <FormControl component="fieldset">
              <RadioGroup name="cancellation-selection" onChange={e => this._setCancelSubscriptionReason(e)}>
                {cancelSubscriptionReasons.map((item, index) => (
                  <FormControlLabel value={item} control={<Radio />} label={item} key={index} style={{ marginTop: '0px' }} />
                ))}
              </RadioGroup>
              <Input
                id="reason_other"
                name="reason_other"
                value={this.state.cancelSubscriptionReasonOther}
                disabled={this.state.cancelSubscriptionReason !== 'Other'}
                onChange={e => this._setCancelSubscriptionReasonOther(e)}
                placeholder="Fill in reason"
                style={{ marginLeft: '30px' }}
              />
            </FormControl>
          </DialogContent>
        ) : (
          <DialogContent>
            <p>
              <strong>You can now click &#39;confirm&#39; to cancel your plan and deactivate your account.</strong>
            </p>
            <p>
              We will start the process of closing your account. Meanwhile, you can continue using Mender until the end of the current month. You will receive
              your final charge for this period at the beginning of next month.
            </p>
            <p>Thank you for using Mender!</p>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={this.props.onCancel}>Stay subscribed</Button>
          <div style={{ flexGrow: 1 }} />
          {!this.state.confirm ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this._confirm()}
              disabled={
                this.state.cancelSubscriptionReason == '' || (this.state.cancelSubscriptionReason == 'Other' && this.state.cancelSubscriptionReasonOther == '')
              }
            >
              Continue to deactivate
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.props.onSubmit(this.state.cancelSubscriptionReasonOther || this.state.cancelSubscriptionReason)}
            >
              Confirm deactivation
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

export default CancelRequestDialog;
