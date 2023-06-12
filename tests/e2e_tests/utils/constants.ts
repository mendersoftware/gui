// Copyright 2022 Northern.tech AS
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
export const selectors = {
  deviceGroupSelect: '#deployment-device-group-selection',
  deviceListCheckbox: '.deviceListItem input',
  email: '[name=email]',
  loggedInText: 'text=/License information/i',
  password: '[name=password]',
  passwordConfirmation: '[name=password_confirmation]',
  passwordCurrent: '[name=current_password]',
  passwordNew: '[name=password_new]',
  placeholderExample: '[placeholder*=Example]',
  releaseSelect: '#deployment-release-selection',
  terminalElement: '.terminal.xterm',
  terminalText: '.terminal.xterm textarea'
};

const oneSecond = 1000;
export const timeouts = {
  default: 3 * oneSecond,
  fiveSeconds: 5 * oneSecond,
  tenSeconds: 10 * oneSecond,
  fifteenSeconds: 15 * oneSecond,
  sixtySeconds: 60 * oneSecond
};
