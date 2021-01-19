import React from 'react';
import { LocalOffer as LocalOfferIcon, Close as CloseIcon } from '@material-ui/icons';

const OfferHeader = ({ organization, onHide }) => (
  <div id="offerHeader" className="offerBox">
    <LocalOfferIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
    {organization && organization.trial ? (
      <span>
        Try out the new <b>Remote terminal</b> feature for free with your current trial.&nbsp;
      </span>
    ) : (
      <span>
        Try out the new <b>Remote terminal</b> feature for free on your current plan until March 31st.&nbsp;
      </span>
    )}
    <a href="https://docs.mender.io/add-ons/remote-terminal" target="_blank" rel="noreferrer">
      Read the documentation to learn how to enable it
    </a>
    <CloseIcon style={{ marginLeft: '4px', height: '16px', cursor: 'pointer' }} onClick={onHide} />
  </div>
);

export default OfferHeader;
