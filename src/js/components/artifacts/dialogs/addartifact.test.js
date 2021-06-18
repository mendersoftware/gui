import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AddArtifact from './addartifact';
import { defaultState, undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('AddArtifact Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <AddArtifact onboardingState={{ complete: true }} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows uploading a mender artifact', async () => {
    const uploadMock = jest.fn(() => Promise.resolve());
    const menderFile = new File(['testContent'], 'test.mender');
    const ui = (
      <Provider store={store}>
        <AddArtifact
          onboardingState={{ complete: false }}
          onUploadStarted={jest.fn}
          onUploadFinished={jest.fn}
          uploadArtifact={uploadMock}
          deviceTypes={['qemux86-64']}
          advanceOnboarding={jest.fn}
          releases={Object.values(defaultState.releases.byId)}
        />
      </Provider>
    );
    const { rerender } = render(ui);
    expect(screen.getByText(/Upload a pre-built .mender Artifact/i)).toBeInTheDocument();
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    userEvent.upload(uploadInput, menderFile);
    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument());
    expect(screen.getByDisplayValue('test.mender')).toBeInTheDocument();
    // FileSize component is not an input based component -> query text only
    expect(screen.getByText('11.00 Bytes')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /upload/i }));
    expect(uploadMock).toHaveBeenCalled();
  });

  it('allows creating a mender artifact', async () => {
    const uploadMock = jest.fn(() => Promise.resolve());
    const menderFile = new File(['testContent plain'], 'test.txt');
    const ui = (
      <Provider store={store}>
        <AddArtifact
          open={true}
          onUploadStarted={jest.fn}
          onUploadFinished={jest.fn}
          onboardingState={{ complete: true }}
          createArtifact={uploadMock}
          deviceTypes={['qemux86-64']}
          advanceOnboarding={jest.fn}
          releases={Object.values(defaultState.releases.byId)}
        />
      </Provider>
    );
    const { rerender } = render(ui);
    expect(screen.getByText(/Upload a pre-built .mender Artifact/i)).toBeInTheDocument();
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    userEvent.upload(uploadInput, menderFile);
    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.getByPlaceholderText('Example: /opt/installed-by-single-file')).toBeInTheDocument());
    expect(screen.getByDisplayValue('test.txt')).toBeInTheDocument();
    // FileSize component is not an input based component -> query text only
    expect(screen.getByText('17.00 Bytes')).toBeInTheDocument();
    userEvent.click(screen.getByPlaceholderText('Example: /opt/installed-by-single-file'));
    userEvent.type(screen.getByPlaceholderText('Example: /opt/installed-by-single-file'), 'some/path');
    await waitFor(() => expect(screen.getByText(/Destination has to be an absolute path/i)).toBeInTheDocument());
    userEvent.click(screen.getByPlaceholderText('Example: /opt/installed-by-single-file'));
    userEvent.type(screen.getByPlaceholderText('Example: /opt/installed-by-single-file'), '/some/path');
    userEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: /device types compatible/i })).toBeInTheDocument());
    userEvent.type(screen.getByRole('textbox', { name: /device types compatible/i }), 'something');
    userEvent.type(screen.getByRole('textbox', { name: /release name/i }), 'some release');
    userEvent.click(screen.getByRole('button', { name: /upload/i }));
    expect(uploadMock).toHaveBeenCalled();
  });
});
