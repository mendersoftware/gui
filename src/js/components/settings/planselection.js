import React from 'react';
import { makeStyles } from 'tss-react/mui';

import { PLANS } from '../../constants/appConstants';
import InfoText from '../common/infotext';

export const useStyles = makeStyles()(theme => ({
  planNote: { marginBottom: -11, fontSize: 'smaller' },
  planPanel: {
    borderColor: theme.palette.background.lightgrey,
    ['&.active,&:hover']: {
      borderColor: theme.palette.grey[50],
      boxShadow: '0 1px 6px rgba(0, 0, 0, 0.15)'
    },
    ['&.active']: {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[400]
    }
  },
  price: { fontSize: '1rem' }
}));

export const PlanSelection = ({ currentPlan = 'os', isTrial, offerValid, offerTag, setUpdatedPlan, updatedPlan }) => {
  const { classes } = useStyles();
  const canUpgrade = plan => Object.keys(PLANS).indexOf(plan) >= Object.keys(PLANS).indexOf(currentPlan);
  const onPlanSelect = plan => (isTrial || canUpgrade(plan) ? setUpdatedPlan(plan) : undefined);
  return (
    <>
      <h3 className="margin-top">{isTrial ? '1. Choose a plan' : 'Plans'}</h3>
      <div className="flexbox space-between" style={{ paddingBottom: 15 }}>
        {Object.values(PLANS).map(item => (
          <div
            key={item.value}
            className={`planPanel ${classes.planPanel} ${updatedPlan === item.value ? 'active' : ''} ${isTrial || canUpgrade(item.value) ? '' : 'muted'}`}
            onClick={() => onPlanSelect(item.value)}
          >
            {!isTrial && canUpgrade(item.value) && (
              <div className={`uppercased align-center muted ${classes.planNote}`}>{item.value === currentPlan ? 'current plan' : 'upgrade'}</div>
            )}
            <h4>
              {item.name} {item.offer && isTrial && offerValid ? offerTag : null}
            </h4>
            <div>
              {item.offer && isTrial && offerValid ? (
                <>
                  <div className={`link-color bold ${classes.price}`}>{item.offerprice}</div>
                  <div className="pre-line">{item.price2}</div>
                </>
              ) : (
                <>
                  <div className={`link-color bold ${classes.price}`}>{item.price}</div>
                  <div>{item.deviceCount}</div>
                </>
              )}
            </div>
            <ul className="unstyled">
              {item.features.map((feature, index) => (
                <li key={`${item.value}-feature-${index}`}>
                  <InfoText variant="dense">{feature}</InfoText>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
};

export default PlanSelection;
