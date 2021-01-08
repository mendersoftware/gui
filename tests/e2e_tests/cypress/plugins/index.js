const { v4: uuid } = require('uuid');
const { spawn } = require('child_process');
const generateOtp = require('cypress-otp');
const fs = require('fs');

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
    startDockerClient({ token }) {
      const connectConfigFile = fs.readFileSync('dockerClient/mender-connect.json');
      let connectConfig = JSON.parse(connectConfigFile);
      connectConfig.ServerURL = process.env.SERVER_URL || 'https://docker.mender.io';
      fs.writeFileSync('dockerClient/mender-connect-test.json', JSON.stringify(connectConfig));
      let args = ['run', '-v dockerClient/mender-connect-test.json:/etc/mender/mender-connect.conf', 'mendersoftware/mender-client-docker:connect'];
      if (token) {
        console.log(`starting with: ${token}`);
        args.splice(1, 0, `-e TENANT_TOKEN=${token}`);
      }
      let child = spawn('docker', args);
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
