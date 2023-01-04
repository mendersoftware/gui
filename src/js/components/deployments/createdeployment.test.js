import React from 'react';
import { Provider } from 'react-redux';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import CreateDeployment from './createdeployment';
import { RolloutPatternSelection } from './deployment-wizard/phasesettings';
import { ForceDeploy, Retries, RolloutOptions } from './deployment-wizard/rolloutoptions';
import { ScheduleRollout } from './deployment-wizard/schedulerollout';
import { Devices, ReleasesWarning, Software } from './deployment-wizard/softwaredevices';

const mockStore = configureStore([thunk]);

describe('CreateDeployment Component', () => {
  let store;
  let mockState = {
    ...defaultState,
    app: {
      ...defaultState.app,
      features: {
        ...defaultState.features,
        isEnterprise: false,
        isHosted: false
      }
    }
  };

  beforeEach(() => {
    store = mockStore(mockState);
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <CreateDeployment deploymentObject={{}} setDeploymentObject={jest.fn} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  describe('smaller components', () => {
    [Devices, ForceDeploy, ReleasesWarning, Software, ScheduleRollout, Retries, RolloutOptions, RolloutPatternSelection].forEach(Component => {
      const getReleasesMock = jest.fn();
      getReleasesMock.mockResolvedValue();
      const props = {
        commonClasses: { columns: 'test' },
        deploymentObject: { phases: [{ batch_size: 0 }] },
        getReleases: getReleasesMock,
        groups: defaultState.devices.groups.byId,
        hasDynamicGroups: true,
        open: true,
        previousRetries: 0,
        releases: Object.keys(defaultState.releases.byId),
        releasesById: defaultState.releases.byId,
        setDeploymentSettings: jest.fn
      };
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const { baseElement } = render(
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Component {...props} />
          </LocalizationProvider>
        );
        const view = baseElement.lastChild;
        expect(view).toMatchSnapshot();
        expect(view).toEqual(expect.not.stringMatching(undefineds));
        expect(view).toBeTruthy();
      });
      it(`renders ${Component.displayName || Component.name} correctly as enterprise`, () => {
        const { baseElement } = render(
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Component {...props} isEnterprise />
          </LocalizationProvider>
        );
        const view = baseElement.lastChild;
        expect(view).toMatchSnapshot();
        expect(view).toEqual(expect.not.stringMatching(undefineds));
        expect(view).toBeTruthy();
      });
    });
  });
});
