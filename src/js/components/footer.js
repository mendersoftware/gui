import React from 'react';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  footer: {
    background: theme.palette.brand.northernTech,
    display: 'grid',
    minHeight: theme.mixins.toolbar.minHeight,
    gridTemplateColumns: '1fr max-content max-content',
    columnGap: theme.spacing(4),
    paddingLeft: '5vw',
    paddingRight: '5vw',
    alignItems: 'center',
    '>a': {
      color: theme.palette.getContrastText(theme.palette.brand.northernTech)
    }
  }
}));

const companySite = 'https://northern.tech';

const targets = [
  { key: 'company', target: companySite, title: `© ${new Date().getFullYear()} Northern.tech` },
  { key: 'tos', target: `${companySite}/legal/hosted-mender-agreement-10_10_2022-northern-tech-as.pdf`, title: 'Terms of service' },
  { key: 'privacyPolicy', target: `${companySite}/legal/privacy-policy`, title: 'Privacy policy' }
];

export const Footer = () => {
  const { classes } = useStyles();
  return (
    <div className={classes.footer}>
      {targets.map(({ key, target, title }) => (
        <a className="clickable" href={target} key={key} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      ))}
    </div>
  );
};

export default Footer;
