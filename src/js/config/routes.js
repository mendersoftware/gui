import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Artifacts from '../components/artifacts/artifacts';
import AuditLogs from '../components/auditlogs/auditlogs';
import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/device-groups';
import Help from '../components/help/help';
import Login from '../components/login/login';
import Password from '../components/login/password';
import PasswordReset from '../components/login/passwordreset';
import Signup from '../components/login/signup';
import Settings from '../components/settings/settings';

export const PrivateRoutes = () => (
  <Routes>
    <Route path="auditlog" element={<AuditLogs />} />
    <Route path="devices" element={<Devices />}>
      <Route path=":status" element={null} />
    </Route>
    <Route path="releases" element={<Artifacts />}>
      <Route path=":artifactVersion" element={null} />
    </Route>
    <Route path="deployments" element={<Deployments />}>
      <Route path=":tab" element={null} />
    </Route>
    <Route path="settings" element={<Settings />}>
      <Route path=":section" element={null} />
    </Route>
    <Route path="help" element={<Help />}>
      <Route path=":section" element={null} />
    </Route>
    <Route path="*" element={<Dashboard />} />
  </Routes>
);

export const PublicRoutes = () => (
  <Routes>
    <Route path="password" element={<Password />} />
    <Route path="password/:secretHash" element={<PasswordReset />} />
    <Route path="signup" element={<Signup />}>
      <Route path=":campaign" element={null} />
    </Route>
    <Route path="*" element={<Login />} />
  </Routes>
);
