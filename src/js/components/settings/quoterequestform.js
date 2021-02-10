import React, { useState } from 'react';

import { Button, FormControl, FormHelperText, TextField } from '@material-ui/core';

import { ADDONS, PLANS } from '../../constants/appConstants';

export const QuoteRequestForm = ({ addOns, onSendMessage, style, updatedPlan, notification }) => {
  const [message, setMessage] = useState('');
  return (
    <div className="flexbox column" style={style}>
      {updatedPlan === 'enterprise' && (
        <>
          <p>Plan: {PLANS[updatedPlan].name}</p>
          {!!addOns.length && <p>Add-ons: {addOns.map(addon => ADDONS[addon.name].title).join(', ')}</p>}
        </>
      )}
      <FormControl style={{ marginTop: 0 }}>
        <FormHelperText>Your message</FormHelperText>
        <FormHelperText>{notification}</FormHelperText>
        <TextField fullWidth multiline value={message} onChange={e => setMessage(e.target.value)} />
      </FormControl>
      <Button
        className="margin-top margin-bottom"
        color="secondary"
        disabled={!(message || addOns.length)}
        onClick={() => onSendMessage(message)}
        style={{ alignSelf: 'flex-end', margin: '30px 0' }}
        variant="contained"
      >
        Send message
      </Button>
    </div>
  );
};

export default QuoteRequestForm;
