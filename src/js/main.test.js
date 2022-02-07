import React from 'react';
// eslint-disable-next-line import/default
import router from 'react-router-dom';
import { undefineds } from '../../tests/mockData';
import { render } from '../../tests/setupTests';
import { AppProviders } from './main';

describe('Main Component', () => {
  it('renders correctly', async () => {
    const { MemoryRouter } = router;
    const MockBrowserRouter = ({ children }) => <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>;
    // eslint-disable-next-line import/no-named-as-default-member
    router.BrowserRouter = MockBrowserRouter;
    const { baseElement } = render(<AppProviders />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
