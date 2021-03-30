const { v4: uuid } = require('uuid');
const { spawn } = require('child_process');
const generateOtp = require('cypress-otp');
const fs = require('fs');

const { addMatchImageSnapshotPlugin } = require('mzedel-cypress-image-snapshot/plugin');

const updateConfigFileWithUrl = (fileName, serverUrl = 'https://docker.mender.io', token = '', projectRoot) => {
  const connectConfigFile = fs.readFileSync(`dockerClient/${fileName}.json`);
  let connectConfig = JSON.parse(connectConfigFile);
  connectConfig.ServerURL = serverUrl;
  connectConfig.ServerCertificate = '/certs/hosted.pem';
  if (token) {
    connectConfig.TenantToken = token;
  }
  fs.writeFileSync(`${projectRoot}/dockerClient/${fileName}-test.json`, JSON.stringify(connectConfig));
};

module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
    startClient({ token, count }) {
      let args = [
        '-inventory="device_type:qemux86-64,client_version:mender-2.2.0,artifact_name:release-v1,kernel:test Linux version,mac_enp0:12.34"',
        '-invfreq=5',
        '-pollfreq=5',
        `-count=${count}`,
        `-backend=${config.baseUrl.replace(/\/$/, '')}`
      ];
      if (token) {
        args.push(`-tenant=${token}`);
      }
      console.log(`starting using: ./mender-stress-test-client ${args.join(' ')}`);
      let child = spawn('./mender-stress-test-client', args);
      child.on('error', err => console.error(`${err}`));
      child.on('message', err => console.error(`${err}`));
      child.on('spawn', err => console.error(`${err}`));
      // child.stdout.on('data', data => {
      //   console.log(`stdout mstc: ${data}`);
      // });
      child.stderr.on('data', data => {
        console.error(`stderr mstc: ${data}`);
      });
      child.on('close', code => {
        console.log(`child process exited with code ${code}`);
      });

      return null;
    },
    startDockerClient({ token }) {
      const baseUrl = config.baseUrl.replace(/\/$/, '');
      updateConfigFileWithUrl('mender', baseUrl, token, config.projectRoot);
      updateConfigFileWithUrl('mender-connect', baseUrl, token, config.projectRoot);
      let args = [
        'run',
        '--name',
        'connect-client',
        '-v',
        `${config.projectRoot}/hosted.pem:/certs/hosted.pem`,
        '-v',
        `${config.projectRoot}/dockerClient/mender-test.json:/etc/mender/mender.conf`,
        '-v',
        `${config.projectRoot}/dockerClient/mender-connect-test.json:/etc/mender/mender-connect.conf`,
        'mendersoftware/mender-client-docker-addons:master'
      ];
      console.log(`starting with: ${token}`);
      console.log(`starting using: docker ${args.join(' ')}`);
      let child = spawn('docker', args);
      child.on('error', err => console.error(`${err}`));
      child.on('message', err => console.error(`${err}`));
      child.on('spawn', err => console.error(`${err}`));
      // child.stdout.on('data', data => {
      //   console.log(`stdout docker: ${data}`);
      // });
      child.stderr.on('data', data => {
        console.error(`stderr docker: ${data}`);
      });
      child.on('close', code => {
        console.log(`child process exited with code ${code}`);
      });
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
