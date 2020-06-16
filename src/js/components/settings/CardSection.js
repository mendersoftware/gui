/**
* Use the CSS tab above to style your Element's container.
*/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import { Button } from '@material-ui/core';
import Loader from '../common/loader';
import { startUpgrade, cancelUpgrade, completeUpgrade } from '../../actions/organizationActions';

import { setSnackbar } from '../../actions/appActions';
import { preformatWithRequestID } from '../../helpers';

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errors, setErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let secret = await props.startUpgrade(props.org.id);
      if (secret) {
        confirmCard(secret);
      }
    } catch (err) {
      props.setSnackbar(preformatWithRequestID(err.res, `There was an error setting up the account. ${err.res.body.error}`));
      setLoading(false);
    }
  }

  const confirmCard = async (secret) => {
   
    // Use elements.getElement to get a reference to the mounted Element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    try {
      const result = await stripe.confirmCardSetup (
        secret, 
        {
          payment_method: {
            card:cardElement,
          }
        }
      );

      if (result.error) {
        setLoading(false);
        props.setSnackbar(`Error while confirming card: `+ result.error.message);
        props.cancelUpgrade(props.org.id);
      } else {
        setLoading(false);
        props.setSnackbar(`Card confirmed. Updating your account...`);
        // The card setup has succeeded. Display a success message and send
        // to our backend
        try {
          await props.completeUpgrade(props.org.id);
          props.upgradeSuccess();
        } catch (err) {
          props.setSnackbar(preformatWithRequestID(err.res, `There was an error upgrading your account. ${err.res.body.error}`));
        }
        
      }
    } catch (err) {
      setLoading(false);
      props.setSnackbar(`Something went wrong while submitting the form. Please contact support.`);
      props.cancelUpgrade(props.org.id);
    }    
  };

  const stripeElementChange = (event) => {
    setEmpty(false);
    if (event.complete) {
    // enable payment button
      setErrors(false);
    } else if (event.error) {
      // show validation to customer
      setErrors(true);
    }
  }

  return (
    <form className="margin-top-small" onSubmit={handleSubmit}>
      <CardElement className="warning" onChange={(event) => stripeElementChange(event)} />
       { errors ? <p className="warning">There is an error in the form. Please check that your details are correct</p> : null }

      <div id="poweredByStripe">
        All standard credit card fees apply (e.g. foreign transaction fee, if your card has one)
      </div>
 
      <p className="info">Billing will be scheduled monthly, starting from today. You can cancel at any time.</p>
 
      <Button style={{marginTop: '20px'}} variant="contained" color="secondary" type="submit" disabled={errors || loading || empty}>Sign up</Button>
      <Loader show={loading} />
    </form>
  );
};


const actionCreators = { setSnackbar, preformatWithRequestID, startUpgrade, cancelUpgrade, completeUpgrade };

const mapStateToProps = state => {
  return {
    secret: state.secret
  };
};

export default connect(mapStateToProps, actionCreators)(CheckoutForm);