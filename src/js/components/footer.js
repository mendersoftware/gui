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
    color: theme.palette.getContrastText(theme.palette.brand.northernTech),
    alignItems: 'center'
  }
}));

export const Footer = () => {
  const { classes } = useStyles();
  return (
    <div className={classes.footer}>
      <b>© 2022 Northern.tech AS</b>
      <b>Terms of service</b>
      <b>Privacy policy</b>
    </div>
  );
};

export default Footer;
