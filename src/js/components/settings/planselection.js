import React from 'react';

import { PLANS } from '../../constants/appConstants';

const priceStyle = { fontSize: '1rem' };

export const PlanSelection = ({ currentPlan = 'os', isUpgrade, offerValid, offerTag, setUpdatedPlan, trial, updatedPlan }) => {
  return (
    <div className="flexbox space-between" style={{ paddingBottom: 15 }}>
      {Object.values(PLANS).map(item => (
        <div key={item.value} className={`planPanel ${updatedPlan === item.value ? 'active' : ''}`} onClick={() => setUpdatedPlan(item.value)}>
          {isUpgrade && (
            <div className="uppercased align-center muted" style={{ marginBottom: -11, fontSize: 'smaller' }}>
              {item.value === currentPlan ? 'current plan' : 'upgrade'}
            </div>
          )}
          <h4>
            {item.name} {item.offer && trial && offerValid ? offerTag : null}
          </h4>
          <div>
            {item.offer && trial && offerValid ? (
              <>
                <div className="link-color bold" style={priceStyle}>
                  {item.offerprice}
                </div>
                <div className="pre-line">{item.price2}</div>
              </>
            ) : (
              <>
                <div className="link-color bold" style={priceStyle}>
                  {item.price}
                </div>
                <div>{item.deviceCount}</div>
              </>
            )}
          </div>
          <ul className="unstyled">
            {item.features.map((feature, index) => (
              <li key={`${item.value}-feature-${index}`}>
                <span className="info">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PlanSelection;
