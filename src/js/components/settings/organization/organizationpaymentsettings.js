import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Error as ErrorIcon } from '@mui/icons-material';

import { setSnackbar } from '../../../actions/appActions';
import { confirmCardUpdate, getCurrentCard, startCardUpdate } from '../../../actions/organizationActions';
import CardSection from '../cardsection';
import OrganizationSettingsItem from './organizationsettingsitem';

export const OrganizationPaymentSettings = ({ card, confirmCardUpdate, getCurrentCard, hasUnpaid, setSnackbar, startCardUpdate }) => {
  const [isUpdatingPaymentDetails, setIsUpdatingPaymentDetails] = useState(false);

  useEffect(() => {
    getCurrentCard();
  }, []);

  const onCardConfirm = async () => {
    await confirmCardUpdate();
    getCurrentCard();
    setIsUpdatingPaymentDetails(false);
  };

  // const invoiceDate = moment();
  const { last4, expiration, brand } = card;
  return (
    <>
      {/* <OrganizationSettingsItem
                  title="Next payment date"
                  content={{
                    action: { title: 'View invoices', internal: true, action: setShowInvoices },
                    description: invoiceDate.format('MMMM DD, YYYY')
                  }}
                  notification={<div className="text-muted">Your subscription will be charged automatically</div>}
                /> */}
      <OrganizationSettingsItem
        title="Payment card"
        content={{
          action: { title: `${last4 ? 'Update' : 'Enter'} payment card`, internal: true, action: () => setIsUpdatingPaymentDetails(true) },
          description: last4 ? (
            <div>
              <div>
                {brand} ending in {last4}
              </div>
              <div>
                Expires {`0${expiration.month}`.slice(-2)}/{`${expiration.year}`.slice(-2)}
              </div>
            </div>
          ) : (
            <div>
              The introduction of the PSD2 regulation in Europe requires re-entering your card details before we can allow the modification of payment details
              or access to the payment history.
            </div>
          )
        }}
        secondary={
          isUpdatingPaymentDetails && (
            <CardSection onCancel={() => setIsUpdatingPaymentDetails(false)} onComplete={onCardConfirm} onSubmit={startCardUpdate} setSnackbar={setSnackbar} />
          )
        }
        notification={
          hasUnpaid && (
            <div className="red flexbox centered">
              <ErrorIcon fontSize="small" />
              <span className="margin-left-small">You have an unpaid invoice. Please check your payment card details</span>
            </div>
          )
        }
      />
    </>
  );
};

const actionCreators = { confirmCardUpdate, getCurrentCard, startCardUpdate, setSnackbar };

const mapStateToProps = state => {
  return {
    card: state.organization.card,
    hasUnpaid: state.organization.billing
  };
};

export default connect(mapStateToProps, actionCreators)(OrganizationPaymentSettings);
