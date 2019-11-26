import React from 'react';
import moment from 'moment';
import { Divider, IconButton } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

const MonthlyBillingInformation = ({ billingInformation, changeTimeframe, creationDate, isVisible }) => {
  const { interactions, timeframe, timestamp, total } = billingInformation;
  const today = new Date();
  const isCurrent = timeframe.month === today.getMonth() && timeframe.year === today.getFullYear();
  const isFirst = timeframe.month === creationDate.getMonth() && timeframe.year === creationDate.getFullYear();
  const timeframeStart = moment(timeframe);
  const timeframeEnd = moment(timeframe).add(1, 'months');
  return (
    <div className={isVisible ? '' : 'muted'}>
      <div className="flexbox centered space-between">
        <h2>Monthly usage</h2>
        <div className="muted">{`Updated ${moment(timestamp).format('MMMM Do Y HH:mm')} UTC`}</div>
      </div>
      <div className="flexbox centered" style={{ justifyContent: 'flex-start' }}>
        <h4>Billing Period:</h4>
        <div className="muted margin-left">
          <IconButton onClick={() => changeTimeframe(-1)} disabled={isFirst}>
            <KeyboardArrowLeft />
          </IconButton>
          {`${timeframeStart.format('MMMM Do')} - ${timeframeEnd.format('MMMM Do Y')}`}
          {isCurrent ? (
            <span className="margin-left-small">(current)</span>
          ) : (
            <IconButton onClick={() => changeTimeframe(+1)} disabled={isCurrent}>
              <KeyboardArrowRight />
            </IconButton>
          )}
        </div>
      </div>
      <div className="billing-interaction">
        <div className="billing-item">
          <div></div>
          <div>Quantity</div>
          <div>Unit fee</div>
          <div>Subtotal</div>
        </div>
      </div>
      {interactions.map((interaction, index) => (
        <div className="billing-interaction" key={`billing-information-${index}`}>
          <h4 className="margin-left">{interaction.title}</h4>
          {interaction.billingInformation.map(information => (
            <div key={information.key}>
              <div className="bordered billing-item billing-information">
                <div>{information.title}</div>
                <div>{information.quantity}</div>
                <div>{`$ ${information.unitFee}`}</div>
                <div>{`$ ${information.total}`}</div>
              </div>
              <div className="muted margin-left-small">{information.explanation}</div>
            </div>
          ))}
        </div>
      ))}
      <Divider />
      <div className="flexbox column" style={{ alignItems: 'flex-end' }}>
        <div className="flexbox">
          <h2 className="muted margin-right-small">Total</h2>
          <h2>{`$${total}`}</h2>
        </div>
        {isCurrent && <div>{`Next payment date: ${timeframeEnd.format('MMMM Do')}`}</div>}
      </div>
    </div>
  );
};

export default MonthlyBillingInformation;
