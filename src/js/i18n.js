import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import moment from 'moment';

const resources = {
  en: {
    translation: {
      demo: {
        title: 'Demo mode',
        note: 'Mender is currently running in <b>demo mode</b>.',
        reference: 'See the documentation for help switching to production mode'
      },

      devices: {
        devices: 'device',
        devices_plural: 'devices',
        limitNotification: `<h3>Device limit</h3>
        <p>$t(devices.limit, { "context": "{{limitStatus}}", "delta": {{delta}} })</p>
        <p>If you need a higher device limit, you can contact us by email at <supportMailLink>support@mender.io</supportMailLink> to change your plan.</p>
        <p>Learn about the different plans available by visiting<externalLink>mender.io/pricing</externalLink></p>`,
        limit: `You can still connect another {{delta}} $t(devices.devices, { "count": {{delta}} }).`,
        limit_approaching: 'You are nearing your device limit.',
        limit_reached: 'You have reached your device limit.',
        pending: {
          title: 'Pending',
          counter: '{{count}} pending'
        }
      },
      help: {
        title: 'Help',
        upgrade: {
          title: 'Upgrade now'
        }
      },
      logout: 'Log out',
      settings: {
        title: 'Settings',
        user: 'My profile',
        organization: 'My organization',
        userManagement: 'User management',
        helpTooltips: 'Show help tooltips',
        helpTooltips_true: 'Show help tooltips',
        helpTooltips_false: 'Hide help tooltips'
      },
      trial: {
        title: 'Trial version',
        notification: `<p>You're using the trial version of Mender – it's free for up to 10 devices for 12 months.</p>
        <p>
          <internalLink>Upgrade to a plan</internalLink> to add more devices and continue using Mender after the trial expires.
        </p>
        <p>Or compare the plans at<externalLink>mender.io/plans/pricing</externalLink>.</p>`
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: 'en',
  keySeparator: '.'
});

i18n.on('languageChanged', lng => {
  moment.locale(lng);
});

export default i18n;
