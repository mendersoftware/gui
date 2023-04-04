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
