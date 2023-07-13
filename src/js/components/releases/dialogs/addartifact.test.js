// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import AddArtifact from './addartifact';

describe('AddArtifact Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<AddArtifact onboardingState={{ complete: true }} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows uploading a mender artifact', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const uploadMock = jest.fn(() => Promise.resolve());
    const menderFile = new File(['testContent'], 'test.mender');
    const ui = (
      <AddArtifact
        createArtifact={jest.fn}
        onboardingState={{ complete: false }}
        onUploadStarted={jest.fn}
        uploadArtifact={uploadMock}
        deviceTypes={['qemux86-64']}
        advanceOnboarding={jest.fn}
        releases={Object.values(defaultState.releases.byId)}
      />
    );
    const { rerender } = render(ui);
    expect(screen.getByText(/Upload a premade/i)).toBeInTheDocument();
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    await user.upload(uploadInput, menderFile);
    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument());
    expect(screen.getByText('test.mender')).toBeInTheDocument();
    // FileSize component is not an input based component -> query text only
    expect(screen.getByText('11.00 Bytes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /upload/i }));
    expect(uploadMock).toHaveBeenCalled();
  });

  it('allows creating a mender artifact', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const uploadMock = jest.fn(() => Promise.resolve());
    const menderFile = new File(['testContent plain'], 'testFile.txt');
    const ui = (
      <AddArtifact
        onUploadStarted={jest.fn}
        onboardingState={{ complete: true }}
        createArtifact={uploadMock}
        deviceTypes={['qemux86-64']}
        advanceOnboarding={jest.fn}
        releases={Object.values(defaultState.releases.byId)}
      />
    );
    const { rerender } = render(ui);
    expect(screen.getByText(/Upload a premade/i)).toBeInTheDocument();
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    await user.upload(uploadInput, menderFile);
    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => rerender(ui));
    const placeholderText = 'Example: /opt/installed-by-single-file';
    await waitFor(() => expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument());
    expect(screen.getByText('testFile.txt')).toBeInTheDocument();
    // FileSize component is not an input based component -> query text only
    expect(screen.getByText('17.00 Bytes')).toBeInTheDocument();
    await user.click(screen.getByPlaceholderText(placeholderText));
    await user.type(screen.getByPlaceholderText(placeholderText), 'some/path');
    await waitFor(() => expect(screen.getByText(/Destination has to be an absolute path/i)).toBeInTheDocument());
    await user.click(screen.getByPlaceholderText(placeholderText));
    await user.clear(screen.getByPlaceholderText(placeholderText));
    await user.type(screen.getByPlaceholderText(placeholderText), '/some/path');
    await waitFor(() => expect(screen.getByRole('combobox', { name: /device types compatible/i })).toBeInTheDocument());
    await user.type(screen.getByRole('combobox', { name: /device types compatible/i }), 'something');
    await user.type(screen.getByLabelText(/release name/i), 'some release');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => rerender(ui));
    await user.click(screen.getByRole('button', { name: /upload/i }));
    expect(uploadMock).toHaveBeenCalled();
  });
});
