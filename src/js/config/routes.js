import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AuditLogs from '../components/auditlogs/auditlogs';
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
    <Route path="settings" element={<Settings />}>
      <Route path=":section" element={null} />
    </Route>
    <Route path="help" element={<Help />}>
      <Route path=":section" element={null} />
    </Route>
    <Route path="*" element={<Devices />}>
      <Route path=":status" element={null} />
    </Route>
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
