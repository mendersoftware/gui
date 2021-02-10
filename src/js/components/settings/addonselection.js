import React from 'react';

import { Button, Checkbox } from '@material-ui/core';

import { ADDONS } from '../../constants/appConstants';

const priceStyle = { fontSize: '1rem' };

export const AddOnSelection = ({ addons = [], isUpgrade = true, onChange, onSubmit }) => {
  const onAddOnClick = (e, name, enabled) => {
    if (e.target.tagName === 'A') {
      return;
    }
    let changedAddOns = addons.filter(item => item.name !== name);
    if (enabled) {
      changedAddOns.push({ name, enabled });
    }
    onChange(changedAddOns);
  };

  const noteStyle = { minWidth: isUpgrade ? 120 : 150 };
  return (
    <div className="flexbox column">
      {isUpgrade && (
        <p>
          Extend Mender features with our add-ons. Select one or more from the list and submit to request add-ons to be added to your plan. We&apos;ll adjust
          your subscription and confirm it with you.
        </p>
      )}
      {Object.entries(ADDONS).map(([addOnName, addOn]) => {
        const isEnabled = addons.some(orgAddOn => orgAddOn.enabled && addOnName === orgAddOn.name);
        return (
          <div
            key={addOnName}
            className={`planPanel flexbox ${isEnabled ? 'active' : ''}`}
            style={{ alignItems: 'center', height: 'initial', marginTop: 10, width: 'initial' }}
            onClick={e => onAddOnClick(e, addOnName, !isEnabled)}
          >
            <Checkbox checked={isEnabled} />
            <div className="bold" style={noteStyle}>
              {addOn.title}
            </div>
            {isUpgrade && (
              <div className="flexbox column" style={noteStyle}>
                <div className="link-color bold" style={priceStyle}>
                  {addOn.price}
                </div>
                <div>{addOn.deviceCount}</div>
              </div>
            )}
            <span className="info">{addOn.description}</span>
            <a className="margin-left-small" href="https://mender.io/plans/features" target="_blank" rel="noopener noreferrer">
              Learn more
            </a>
          </div>
        );
      })}
      {isUpgrade && (
        <Button
          className="margin-top margin-bottom"
          variant="contained"
          color="secondary"
          onClick={() => onSubmit(addons)}
          style={{ alignSelf: 'flex-end', margin: '30px 0' }}
        >
          Submit
        </Button>
      )}
    </div>
  );
};

export default AddOnSelection;
