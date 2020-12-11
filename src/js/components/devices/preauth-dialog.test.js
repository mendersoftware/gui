import React from 'react';
import { render } from '@testing-library/react';
import PreauthDialog from './preauth-dialog';
import { undefineds } from '../../../../tests/mockData';

describe('PreauthDialog Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(
      <PreauthDialog deviceLimitWarning={<div>I should not be rendered/ undefined</div>} limitMaxed={false} onSubmit={jest.fn} onCancel={jest.fn} />
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
