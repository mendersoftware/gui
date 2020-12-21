import React from 'react';
import router from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Main } from './main';
import { undefineds } from '../../tests/mockData';

describe('Main Component', () => {
  it('renders correctly', async () => {
    const { MemoryRouter } = router;
    const MockBrowserRouter = ({ children }) => <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>;
    router.BrowserRouter = MockBrowserRouter;
    const tree = renderer.create(<Main />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
