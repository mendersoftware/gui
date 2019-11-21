import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import appReducer from './appReducer';
import deploymentReducer from './deploymentReducer';
import deviceReducer from './deviceReducer';
import releaseReducer from './releaseReducer';
import userReducer from './userReducer';

const rootReducer = combineReducers({
  app: appReducer,
  devices: deviceReducer,
  deployments: deploymentReducer,
  releases: releaseReducer,
  users: userReducer
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export default store;
