import React from 'react';
import { Link } from 'react-router-dom';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';

const OfferHeader = () => (
  <div id="offerHeader" className="offerBox">
    <LocalOfferIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
    <span>
      End of year offer – receive 20% discount for 6 months when you upgrade to a paid Mender plan before Dec 31.{' '}
      <Link to="/settings/upgrade">Learn more and upgrade now</Link>
    </span>
  </div>
);

export default OfferHeader;
