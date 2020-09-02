import React from 'react';
import ReactTooltip from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

const DemoNotification = ({ docsVersion = 'development/' }) => {
  const { t } = useTranslation();
  return (
    <div id="demoBox" className="flexbox centered">
      <a id="demo-info" data-tip data-for="demo-mode" data-event="click focus" data-offset="{'bottom': 15}">
        <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
        {t('demo.title')}
      </a>

      <ReactTooltip id="demo-mode" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
        <h3>{t('demo.title')}</h3>
        <p>{t('demo.note')}</p>
        <p>
          <a href={`https://docs.mender.io/${docsVersion}server-installation/production-installation`} target="_blank">
            {t('demo.reference')}
          </a>
          .
        </p>
      </ReactTooltip>
    </div>
  );
};

export default DemoNotification;
