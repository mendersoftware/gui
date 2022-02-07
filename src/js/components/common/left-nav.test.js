import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import LeftNav from './left-nav';

describe('LeftNav Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <LeftNav
        sections={[
          {
            itemClass: 'test-list',
            items: [
              { exact: true, path: '/far/away', secondaryAction: <div>HEYA!</div>, style: { background: 'red' }, title: 'test1' },
              { path: '/far/away', title: 'test1' }
            ],
            title: 'test'
          }
        ]}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
