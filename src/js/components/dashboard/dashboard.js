import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { makeStyles } from 'tss-react/mui';

import { setSnackbar } from '../../actions/appActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingState } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Loader from '../common/loader';
import Deployments from './deployments';
import Devices from './devices';
import SoftwareDistribution from './software-distribution';

const useStyles = makeStyles()(theme => ({
  board: {
    columnGap: theme.spacing(6),
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: '80vh'
  },
  left: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: '60vw',
    display: 'flex',
    position: 'relative',
    rowGap: theme.spacing(6),
    flexDirection: 'column',
    [theme.breakpoints.up('xl')]: { minWidth: '45vw' }
  },
  right: {
    flexGrow: 1,
    minWidth: 400,
    border: 'none',
    paddingLeft: 0,
    paddingTop: 0,
    '.deployments .dashboard > h4': { marginTop: theme.spacing(6) },
    '.deployments .dashboard > h4.margin-top-none': { marginTop: 0 },
    [theme.breakpoints.up('xl')]: {
      borderLeft: `1px solid ${theme.palette.grey[500]}`,
      marginTop: theme.spacing(-2),
      paddingLeft: theme.spacing(6),
      paddingTop: theme.spacing(2),
      '.deployments .dashboard > h4': { marginTop: 0 }
    }
  },
  row: { flexWrap: 'wrap', maxWidth: '85vw' }
}));

export const Dashboard = ({ currentUser, hasReporting, onboardingState, setSnackbar }) => {
  const timer = useRef();
  const { classes } = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !onboardingState.showTips) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const notification = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, onboardingState, { setSnackbar });
      !!notification && setSnackbar('open', TIMEOUTS.refreshDefault, '', notification, () => {}, true);
    }, 400);
  }, [currentUser, JSON.stringify(onboardingState)]);
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleClick = params => {
    let redirect;
    if (params.route === 'deployments') {
      let query = params.open ? ['open=true'] : [];
      params.id ? query.push(`id=${params.id}`) : undefined;
      redirect = `/deployments/${params.tab || DEPLOYMENT_ROUTES.active.key}?${query.join('&')}`;
    } else {
      redirect = params.route;
    }
    navigate(redirect);
  };

  return (
    <>
      <h4 className="margin-left-small">Dashboard</h4>
      {currentUser ? (
        <div className={classes.board}>
          <div className={classes.left}>
            <Devices clickHandle={handleClick} />
            {hasReporting ? <SoftwareDistribution /> : <div />}
          </div>
          <Deployments className={classes.right} clickHandle={handleClick} />
        </div>
      ) : (
        <div className="flexbox centered" style={{ height: '75%' }}>
          <Loader show={true} />
        </div>
      )}
    </>
  );
};

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.currentUser,
    hasReporting: state.app.features.hasReporting,
    onboardingState: getOnboardingState(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Dashboard);
