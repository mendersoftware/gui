import React from 'react';
import * as router from 'react-router-dom';

import { render } from '@testing-library/react';
import 'jsdom-worker';

import { undefineds } from '../../tests/mockData';
import { AppProviders } from './main';

describe('Main Component', () => {
  it('renders correctly', async () => {
    const { MemoryRouter } = router;
    window.localStorage.getItem.mockReturnValueOnce('false');
    const MockBrowserRouter = ({ children }) => <MemoryRouter initialEntries={['/ui']}>{children}</MemoryRouter>;
    // eslint-disable-next-line
    router.BrowserRouter = MockBrowserRouter;
    const { baseElement } = render(<AppProviders />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
