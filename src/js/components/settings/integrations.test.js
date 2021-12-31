import React from 'react';
import { render } from '@testing-library/react';
import { IntegrationConfiguration, Integrations } from './integrations';
import { undefineds } from '../../../../tests/mockData';

const integrations = [
  { key: 'iot-hub', provider: 'iot-hub', connectionString: 'something' },
  { key: 'amazon', provider: 'amazon', connectionString: 'something else' }
];

describe('IntegrationConfiguration Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <IntegrationConfiguration integration={{ ...integrations[0], connectionString: '' }} onCancel={jest.fn} onDelete={jest.fn} onSave={jest.fn} />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('Integrations Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Integrations integrations={integrations} changeIntegration={jest.fn} deleteIntegration={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
