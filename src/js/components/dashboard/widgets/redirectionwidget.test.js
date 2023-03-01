import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import RedirectionWidget from './redirectionwidget';

describe('RedirectionWidget Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RedirectionWidget onClick={jest.fn} content="testlocation" />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const content = 'test content';
    const submitCheck = jest.fn();
    render(<RedirectionWidget content={content} onClick={submitCheck} />);

    await user.click(screen.getByText(content));
    expect(screen.queryByText('redirected')).not.toBeInTheDocument();
    expect(submitCheck).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText(content));
    expect(submitCheck).toHaveBeenCalledTimes(2);
  });
});
