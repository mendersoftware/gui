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
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  commonProcessor,
  formatAuditlogs,
  formatDeployments,
  formatDeviceSearch,
  formatPageState,
  formatReleases,
  generateDeploymentsPath,
  generateDevicePath,
  generateReleasesPath,
  parseAuditlogsQuery,
  parseDeploymentsQuery,
  parseDeviceQuery,
  parseReleasesQuery
} from './locationutils';

const processors = {
  auditlogs: {
    format: formatAuditlogs,
    locate: () => undefined,
    parse: parseAuditlogsQuery
  },
  common: {
    format: formatPageState,
    locate: () => undefined,
    parse: commonProcessor
  },
  deployments: {
    format: formatDeployments,
    locate: generateDeploymentsPath,
    parse: parseDeploymentsQuery
  },
  devices: {
    format: formatDeviceSearch,
    locate: generateDevicePath,
    parse: parseDeviceQuery
  },
  releases: {
    format: formatReleases,
    locate: generateReleasesPath,
    parse: parseReleasesQuery
  }
};

export const useLocationParams = (key, extras) => {
  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  let value = useMemo(() => {
    const { pageState, params, sort } = processors.common.parse(searchParams);
    const extendedExtras = { ...extras, pageState, location };
    return {
      ...pageState,
      sort,
      ...processors[key].parse(params, extendedExtras)
    };
  }, [key, searchParams]);

  let setValue = useCallback(
    (newValue, options = {}) => {
      const pathname = processors[key].locate({ pageState: newValue.pageState, location });
      const searchQuery = [processors.common.format(newValue.pageState, extras), processors[key].format(newValue, extras)].filter(i => i).join('&');
      navigate({ pathname, replace: true, search: `?${searchQuery}`, ...options });
    },
    [key, navigate, searchParams, setSearchParams]
  );

  return [value, setValue];
};
