import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import RedirectionWidget from './redirectionwidget';

describe('RedirectionWidget Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RedirectionWidget target="testlocation" buttonContent={<div />} />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const buttonContent = 'test button content';
    const content = 'test content';
    const submitCheck = jest.fn();
    render(
      <>
        <RedirectionWidget target="testlocation" buttonContent={buttonContent} content={content} isActive={true} onClick={submitCheck} />
        <Routes>
          <Route path="/testlocation" element={<div>redirected</div>} />
        </Routes>
      </>
    );

    userEvent.click(screen.getByText(content));
    expect(screen.queryByText('redirected')).not.toBeInTheDocument();
    expect(submitCheck).toHaveBeenCalledTimes(1);
    userEvent.click(screen.getByText(buttonContent));
    expect(submitCheck).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('redirected')).toBeInTheDocument();
  });
});
