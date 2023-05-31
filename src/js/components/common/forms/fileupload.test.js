// Copyright 2021 Northern.tech AS
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

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import FileUpload from './fileupload';

describe('FileUpload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<FileUpload placeholder="test" />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const selectMock = jest.fn();
    const submitMock = jest.fn();

    const menderFile = new File(['testContent plain'], 'test.file');

    const ui = <FileUpload onFileChange={submitMock} onFileSelect={selectMock} placeholder="test placeholder" setSnackbar={jest.fn} />;
    const { rerender } = render(ui);
    expect(screen.getByText(/test placeholder/i)).toBeInTheDocument();
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    await user.upload(uploadInput, menderFile);
    await waitFor(() => rerender(ui));

    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => expect(document.querySelector('.dropzone input')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('test.file')).toBeInTheDocument();

    expect(submitMock).toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalled();
  });
});
