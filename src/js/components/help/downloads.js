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
import React, { useCallback, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { ArrowDropDown, ExpandMore, FileDownloadOutlined as FileDownloadIcon, Launch } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Chip, Menu, MenuItem, Typography } from '@mui/material';

import copy from 'copy-to-clipboard';
import Cookies from 'universal-cookie';

import { setSnackbar } from '../../actions/appActions';
import { getToken } from '../../auth';
import { detectOsIdentifier, toggle } from '../../helpers';
import { getCurrentUser, getDocsVersion, getIsEnterprise, getTenantCapabilities } from '../../selectors';
import Tracking from '../../tracking';
import Time from '../common/time';

const cookies = new Cookies();

const osMap = {
  MacOs: 'darwin',
  Unix: 'linux',
  Linux: 'linux'
};

const architectures = {
  all: 'all',
  amd64: 'amd64',
  arm64: 'arm64',
  armhf: 'armhf'
};

const defaultArchitectures = [architectures.armhf, architectures.arm64, architectures.amd64];
const defaultOSVersions = ['debian+buster', 'debian+bullseye', 'ubuntu+bionic', 'ubuntu+focal'];

const getVersion = (versions, id) => versions[id] || 'master';

const downloadLocations = {
  public: 'https://downloads.mender.io',
  private: 'https://downloads.customer.mender.io/content/hosted'
};

const defaultLocationFormatter = ({ os, tool, versionInfo }) => {
  const { id, location = downloadLocations.public, osList = [], title } = tool;
  let locations = [{ location: `${location}/${id}/${getVersion(versionInfo, id)}/linux/${id}`, title }];
  if (osList.length) {
    locations = osList.reduce((accu, supportedOs) => {
      const title = Object.entries(osMap).find(entry => entry[1] === supportedOs)[0];
      accu.push({
        location: `${location}/${id}/${getVersion(versionInfo, id)}/${supportedOs}/${id}`,
        title,
        isUserOs: osMap[os] === supportedOs
      });
      return accu;
    }, []);
  }
  return { locations };
};

const osArchLocationReducer = ({ archList, location = downloadLocations.public, packageName, packageId, id, osList, versionInfo }) =>
  osList.reduce((accu, os) => {
    const osArchitectureLocations = archList.map(arch => ({
      location: `${location}/repos/debian/pool/main/${id[0]}/${packageName || packageId || id}/${encodeURIComponent(
        `${packageId}_${getVersion(versionInfo, id)}-1+${os}_${arch}.deb`
      )}`,
      title: `${os} - ${arch}`
    }));
    accu.push(...osArchitectureLocations);
    return accu;
  }, []);

const multiArchLocationFormatter = ({ tool, versionInfo }) => {
  const { id, packageId: packageName, packageExtras = [] } = tool;
  const packageId = packageName || id;
  const locations = osArchLocationReducer({ ...tool, packageId, versionInfo });
  const extraLocations = packageExtras.reduce((accu, extra) => {
    accu[extra.packageId] = osArchLocationReducer({ ...tool, ...extra, packageName: packageId, versionInfo });
    return accu;
  }, {});
  return { locations, ...extraLocations };
};

const nonOsLocationFormatter = ({ tool, versionInfo }) => {
  const { id, location = downloadLocations.public, title } = tool;
  return {
    locations: [
      {
        location: `${location}/${id}/${getVersion(versionInfo, id)}/${id}-${getVersion(versionInfo, id)}.tar.xz`,
        title
      }
    ]
  };
};

const getAuthHeader = (headerFlag, tokens) => {
  let header = `${headerFlag} "Cookie: JWT=${getToken()}"`;
  if (tokens.length) {
    header = `${headerFlag} "Authorization: Bearer ${tokens[0]}"`;
  }
  return header;
};

const defaultCurlDownload = ({ location, tokens }) => `curl ${getAuthHeader('-H', tokens)} -LO ${location}`;

const defaultWgetDownload = ({ location, tokens }) => `wget ${getAuthHeader('--header', tokens)} ${location}`;

const defaultGitlabJob = ({ location, tokens }) => {
  const filename = location.substring(location.lastIndexOf('/') + 1);
  return `
download:mender-tools:
  image: curlimages/curl
  stage: download
  variables:
    ${tokens.length ? `MENDER_TOKEN: ${tokens}` : `MENDER_JWT: ${getToken()}`}
  script:
    - if [ -n "$MENDER_TOKEN" ]; then
    - curl -H "Authorization: Bearer $MENDER_TOKEN" -LO ${location}
    - else
    - ${defaultCurlDownload({ location, tokens })}
    - fi
  artifacts:
    expire_in: 1w
    paths:
      - ${filename}
`;
};

const tools = [
  {
    id: 'mender',
    packageId: 'mender-client',
    packageExtras: [{ packageId: 'mender-client-dev', archList: [architectures.all] }],
    title: 'Mender Client Debian package',
    getLocations: multiArchLocationFormatter,
    canAccess: () => true,
    osList: defaultOSVersions,
    archList: defaultArchitectures
  },
  {
    id: 'mender-artifact',
    title: 'Mender Artifact',
    getLocations: defaultLocationFormatter,
    canAccess: () => true,
    osList: [osMap.MacOs, osMap.Linux]
  },
  {
    id: 'mender-binary-delta',
    title: 'Mender Binary Delta generator and Update Module',
    getLocations: nonOsLocationFormatter,
    location: downloadLocations.private,
    canAccess: ({ isEnterprise, tenantCapabilities }) => isEnterprise || tenantCapabilities.canDelta
  },
  {
    id: 'mender-cli',
    title: 'Mender CLI',
    getLocations: defaultLocationFormatter,
    canAccess: () => true,
    osList: [osMap.MacOs, osMap.Linux]
  },
  {
    id: 'mender-configure-module',
    packageId: 'mender-configure',
    packageExtras: [
      { packageId: 'mender-configure-demo', archList: [architectures.all] },
      { packageId: 'mender-configure-timezone', archList: [architectures.all] }
    ],
    title: 'Mender Configure',
    getLocations: multiArchLocationFormatter,
    canAccess: ({ tenantCapabilities }) => tenantCapabilities.hasDeviceConfig,
    osList: defaultOSVersions,
    archList: [architectures.all]
  },
  {
    id: 'mender-connect',
    title: 'Mender Connect',
    getLocations: multiArchLocationFormatter,
    canAccess: () => true,
    osList: defaultOSVersions,
    archList: defaultArchitectures
  },
  {
    id: 'mender-convert',
    title: 'Mender Convert',
    getLocations: ({ versionInfo }) => ({
      locations: [
        {
          location: `https://github.com/mendersoftware/mender-convert/archive/refs/tags/${getVersion(versionInfo, 'mender-convert')}.zip`,
          title: 'Mender Convert'
        }
      ]
    }),
    canAccess: () => true
  },
  {
    id: 'mender-gateway',
    title: 'Mender Gateway',
    getLocations: multiArchLocationFormatter,
    location: downloadLocations.private,
    canAccess: ({ isEnterprise }) => isEnterprise,
    osList: defaultOSVersions,
    archList: defaultArchitectures
  },
  {
    id: 'monitor-client',
    packageId: 'mender-monitor',
    title: 'Mender Monitor',
    getLocations: multiArchLocationFormatter,
    location: downloadLocations.private,
    canAccess: ({ tenantCapabilities }) => tenantCapabilities.hasMonitor,
    osList: defaultOSVersions,
    archList: [architectures.all]
  }
];

const copyOptions = [
  { id: 'curl', title: 'Curl command', format: defaultCurlDownload },
  { id: 'wget', title: 'Wget command', format: defaultWgetDownload },
  { id: 'gitlab', title: 'Gitlab Job definition', format: defaultGitlabJob }
];

const DocsLink = ({ className = '', docsVersion, path, title }) => (
  <a className={className} href={`https://docs.mender.io/${docsVersion}${path}`} target="_blank" rel="noopener noreferrer">
    {title} <Launch style={{ verticalAlign: 'text-bottom' }} fontSize="small" />
  </a>
);

const DownloadableComponents = ({ locations, onMenuClick }) => {
  const onLocationClick = (location, title) => {
    console.log(location);
    Tracking.event({ category: 'download', action: title });
    cookies.set('JWT', getToken(), { path: '/', maxAge: 60, domain: '.mender.io', sameSite: false });
    const link = document.createElement('a');
    link.href = location;
    link.rel = 'noopener noreferrer';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return locations.map(({ isUserOs, location, title }) => (
    <React.Fragment key={location}>
      <Chip
        avatar={<FileDownloadIcon />}
        className="margin-bottom-small margin-right-small"
        clickable
        onClick={() => onLocationClick(location, title)}
        variant={isUserOs ? 'filled' : 'outlined'}
        onDelete={onMenuClick}
        deleteIcon={<ArrowDropDown value={location} />}
        label={title}
      />
    </React.Fragment>
  ));
};

const DownloadSection = ({ docsVersion, item, isEnterprise, onMenuClick, os, versionInformation }) => {
  const [open, setOpen] = useState(false);
  const { id, getLocations, packageId, title } = item;
  const { locations, ...extraLocations } = getLocations({ isEnterprise, tool: item, versionInfo: versionInformation.repos, os });

  return (
    <Accordion className="margin-bottom-small" square expanded={open} onChange={() => setOpen(toggle)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <div>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption" className="muted">
            Updated: {<Time format="YYYY-MM-DD" value={versionInformation.releaseDate} />}
          </Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div>
          <DownloadableComponents locations={locations} onMenuClick={onMenuClick} />
          {Object.entries(extraLocations).map(([key, locations]) => (
            <React.Fragment key={key}>
              <h5 className="margin-bottom-none muted">{key}</h5>
              <DownloadableComponents locations={locations} onMenuClick={onMenuClick} />
            </React.Fragment>
          ))}
        </div>
        <DocsLink docsVersion={docsVersion} path={`release-information/release-notes-changelog/${packageId || id}`} title="Changelog" />
      </AccordionDetails>
    </Accordion>
  );
};

export const Downloads = ({ docsVersion = '', isEnterprise, setSnackbar, tenantCapabilities, tokens = [], versions = { repos: {}, releaseDate: '' } }) => {
  const [anchorEl, setAnchorEl] = useState();
  const [currentLocation, setCurrentLocation] = useState('');
  const [os] = useState(detectOsIdentifier());

  const availableTools = useMemo(
    () =>
      tools.reduce((accu, tool) => {
        if (!tool.canAccess({ isEnterprise, tenantCapabilities })) {
          return accu;
        }
        accu.push(tool);
        return accu;
      }, []),
    [isEnterprise, tenantCapabilities]
  );

  const handleToggle = event => {
    setAnchorEl(current => (current ? null : event?.currentTarget.parentElement));
    const location = event?.target.getAttribute('value') || '';
    console.log(location);
    setCurrentLocation(location);
  };

  const handleSelection = useCallback(
    event => {
      const value = event?.target.getAttribute('value') || 'curl';
      const option = copyOptions.find(item => item.id === value);
      copy(option.format({ location: currentLocation, tokens }));
      setSnackbar('Copied to clipboard');
    },
    [currentLocation, tokens]
  );

  return (
    <div>
      <h2>Downloads</h2>
      <p>To get the most out of Mender, download the tools listed below.</p>
      {availableTools.map(tool => (
        <DownloadSection
          docsVersion={docsVersion}
          key={tool.id}
          item={tool}
          isEnterprise={isEnterprise}
          onMenuClick={handleToggle}
          os={os}
          versionInformation={versions}
        />
      ))}
      <Menu id="download-options-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleToggle} variant="menu">
        {copyOptions.map(option => (
          <MenuItem key={option.id} value={option.id} onClick={handleSelection}>
            Copy {option.title}
          </MenuItem>
        ))}
      </Menu>
      <p>
        To learn more about the tools availabe for Mender, read the{' '}
        <DocsLink docsVersion={docsVersion} path="downloads" title="Downloads section in our documentation" />.
      </p>
    </div>
  );
};

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  const { tokens } = getCurrentUser(state);
  return {
    docsVersion: getDocsVersion(state),
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    tenantCapabilities: getTenantCapabilities(state),
    tokens,
    versions: state.app.versionInformation.latestRelease
  };
};

export default connect(mapStateToProps, actionCreators)(Downloads);
