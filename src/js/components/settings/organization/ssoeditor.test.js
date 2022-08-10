import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import SSOEditor from './ssoeditor';

describe('SSOEditor Component', () => {
  it('renders correctly', async () => {
    const config = '<div>not quite right</div>';
    const { baseElement } = render(
      <SSOEditor config={config} onCancel={jest.fn} onSave={jest.fn} fileContent={config} hasSSOConfig={true} open onClose={jest.fn} setFileContent={jest.fn} />
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
