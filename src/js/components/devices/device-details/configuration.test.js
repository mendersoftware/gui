import React from 'react';
import { render } from '@testing-library/react';
import Configuration, { ConfigEditingActions, ConfigUpdateFailureActions, ConfigUpdateNote, ConfigUpToDateNote } from './configuration';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('Configuration Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Configuration device={defaultState.devices.byId.a1} setSnackbar={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('tiny components', () => {
  [ConfigEditingActions, ConfigUpdateFailureActions, ConfigUpdateNote, ConfigUpToDateNote].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          updated_ts="testgroup"
          isUpdatingConfig={true}
          isSetAsDefault={true}
          onSetAsDefaultChange={jest.fn}
          setShowLog={jest.fn}
          onSubmit={jest.fn}
          onCancel={jest.fn}
        />
      );
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
