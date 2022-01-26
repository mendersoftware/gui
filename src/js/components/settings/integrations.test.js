import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import { IntegrationConfiguration, Integrations } from './integrations';

const integrations = [
  {
    id: 'iot-hub',
    provider: 'iot-hub',
    credentials: { type: EXTERNAL_PROVIDER['iot-hub'].credentialsType, [EXTERNAL_PROVIDER['iot-hub'].credentialsAttribute]: 'something' }
  },
  {
    id: 'amazon',
    provider: 'amazon',
    credentials: { type: EXTERNAL_PROVIDER.amazon.credentialsType, [EXTERNAL_PROVIDER.amazon.credentialsAttribute]: 'something else' }
  }
];

describe('IntegrationConfiguration Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <IntegrationConfiguration integration={{ ...integrations[0], connection_string: '' }} onCancel={jest.fn} onDelete={jest.fn} onSave={jest.fn} />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('Integrations Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Integrations integrations={integrations} changeIntegration={jest.fn} deleteIntegration={jest.fn} getIntegrations={jest.fn} />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
