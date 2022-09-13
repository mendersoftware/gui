import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds, webhookEvents } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import Webhooks from './webhooks';
import { WebhookCreation } from './configuration';
import Management from './management';
import Activity from './activity';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';

const mockStore = configureStore([thunk]);

describe('Webhooks Component', () => {
  it('renders correctly', async () => {
    const store = mockStore({ ...defaultState });
    const { baseElement } = render(
      <Provider store={store}>
        <Webhooks />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('renders correctly with entries ', async () => {
    const store = mockStore({
      ...defaultState,
      organization: {
        ...defaultState.organization,
        externalDeviceIntegrations: [
          {
            id: '1',
            credentials: { [EXTERNAL_PROVIDER.webhook.credentialsType]: { url: 'https://example.com' } },
            provider: EXTERNAL_PROVIDER.webhook.provider
          }
        ],
        webhooks: {
          ...defaultState.organization.webhooks,
          events: webhookEvents
        }
      }
    });
    const { baseElement } = render(
      <Provider store={store}>
        <Webhooks />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  describe('static components', () => {
    const props = {
      adding: true,
      editing: true,
      events: webhookEvents,
      getWebhookEvents: jest.fn,
      onCancel: jest.fn,
      onSubmit: jest.fn,
      onRemove: jest.fn
    };
    [Activity, Management, WebhookCreation].forEach(Component => {
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const { baseElement } = render(<Component {...props} />);
        const view = baseElement;
        expect(view).toMatchSnapshot();
        expect(view).toEqual(expect.not.stringMatching(undefineds));
      });
    });
  });
});
