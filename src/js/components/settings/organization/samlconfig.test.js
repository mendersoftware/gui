import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import SamlConfig from './samlconfig';

describe('SamlConfig Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<SamlConfig configs={[{ id: '1', config: `<div>not quite right</div>` }]} onCancel={jest.fn} onSave={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
