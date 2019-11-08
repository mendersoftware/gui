import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { devToolsEnhancer } from 'redux-devtools-extension';
import deviceReducer from './deviceReducer';

const rootReducer = combineReducers({
  devices: deviceReducer
  // deployments: deploymentReducer,
  // releases: releaseReducer,
  // user: userReducer
});

const store = createStore(
  rootReducer,
  compose(
    //   devToolsEnhancer(),
    applyMiddleware(thunkMiddleware)
  )
);

export default store;
