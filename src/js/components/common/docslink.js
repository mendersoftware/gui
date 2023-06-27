// Copyright 2023 Northern.tech AS
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
import React, { forwardRef } from 'react';
import { useSelector } from 'react-redux';

import { getDocsVersion, getFeatures } from '../../selectors';

export const DocsLink = forwardRef(({ children, className = '', path, title = '' }, ref) => {
  const docsVersion = useSelector(getDocsVersion);
  const { isHosted } = useSelector(getFeatures);
  const target = `https://docs.mender.io/${docsVersion}${path}`;

  const onClickHandler = () => {
    const docsParams = { headers: { 'x-mender-docs': docsVersion } };
    fetch(target, isHosted ? {} : docsParams);
  };

  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a className={className} href={target} onClick={onClickHandler} ref={ref} target="_blank" rel={isHosted ? 'noopener noreferrer' : ''}>
      {children ? children : title}
    </a>
  );
});

DocsLink.displayName = 'DocsLink';

export default DocsLink;
