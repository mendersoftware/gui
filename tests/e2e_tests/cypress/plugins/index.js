const { v4: uuid } = require('uuid');
const { spawn } = require('child_process');
const generateOtp = require('cypress-otp');

module.exports = (on, config) => {
  on('task', {
    startClient({ token, count }) {
      let args = [
        `-backend=${process.env.SERVER_URL}`,
        '-inventory="device_type:qemux86-64,client_version:mender-2.2.0,artifact_name:release-v1,kernel:test Linux version,mac_enp0:12.34"',
        '-invfreq=5',
        '-pollfreq=5',
        `-count=${count}`
      ];
      if (token) {
        console.log(`starting with: ${token}`);
        args.push(`-tenant=${token}`);
      }
      let child = spawn('./mender-stress-test-client', args);
      child.on('error', err => console.error(`${err}`));
      return null;
    },
    generateOtp
  });

  if (config.baseUrl.includes('staging.hosted.mender.io')) {
    config.env.username = `${uuid()}@example.com`;
    config.env.password = uuid();
    config.env.environment = 'staging';
    config.demoDeviceName = 'release-v1';
  }
  return config;
};
