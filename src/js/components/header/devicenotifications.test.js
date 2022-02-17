import React from 'react';
import DeviceNotifications from './devicenotifications';
import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceNotifications pending={10} total={100} limit={1000} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly with limits', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceNotifications total={40} limit={250} pending={5} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly close to limits', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceNotifications total={240} limit={250} pending={5} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly at limit', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceNotifications total={250} limit={250} pending={5} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly without limits', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceNotifications total={240} limit={0} pending={5} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
