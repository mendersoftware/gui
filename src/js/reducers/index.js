import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import appReducer from './appReducer';
import deploymentReducer from './deploymentReducer';
import deviceReducer from './deviceReducer';
import organizationReducer from './organizationReducer';
import releaseReducer from './releaseReducer';
import userReducer from './userReducer';
import { USER_LOGOUT } from '../constants/userConstants';

const rootReducer = combineReducers({
  app: appReducer,
  devices: deviceReducer,
  deployments: deploymentReducer,
  organization: organizationReducer,
  releases: releaseReducer,
  users: userReducer
});

const sessionReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    state = undefined;
  }
  return rootReducer(state, action);
};

const store = createStore(sessionReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export default store;
