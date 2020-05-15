import React from 'react';

import EnterpriseNotification from '../common/enterpriseNotification';

const Devices = ({ docsVersion = '', isEnterprise }) => (
  <div>
    <h2>Devices</h2>
    <p>
      A device represents, intuitively, a particular piece of hardware. It is uniquely identified by a set of identity attributes (MAC addresses, user-defined
      UIDs, etc.); think of it as an extension of a unique identifier into a multi-attribute structure.
    </p>
    <h2>Device groups</h2>A device group represents a set of devices sharing the same set of attributes. Device groups can either be static or dynamic, where
    static and dynamic refer to the device membership status.
    <h3>Static groups</h3>
    Static device groups consist of devices with the same group attribute and can only be extended by explicit assignment of the group to the device through the
    API.
    <a href={`https://docs.mender.io/${docsVersion}apis/open-source/management-apis/device-inventory`} target="_blank">
      Read the API documentation for more on static groups and their creation
    </a>
    .
    <br />
    <h3>Dynamic groups</h3>
    Unlike static groups, dynamic group membership is defined by matching a set of filters on the device inventory attributes. Since these attribute values
    might change over time, a device might match different groups because of changing attribute values, thus leading to the group changing dynamically.
    <a href={`https://docs.mender.io/${docsVersion}apis/enterprise/management-apis/device-inventory-v2#filters-post`} target="_blank">
      Read the API documentation for more information on the creation of dynamic groups
    </a>
    .
    <EnterpriseNotification isEnterprise={isEnterprise} recommendedPlan="enterprise" benefit="save dynamic groups and ease device management" />
  </div>
);

export default Devices;
