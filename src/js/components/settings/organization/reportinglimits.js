import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon, Info as InfoIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  accordionClasses,
  listSubheaderClasses
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { getReportingLimits } from '../../../actions/deviceActions';
import { toggle } from '../../../helpers';
import { MenderTooltipClickable } from '../../common/mendertooltip';
import OrganizationSettingsItem from './organizationsettingsitem';

const useStyles = makeStyles()(theme => ({
  accordion: {
    ul: {
      paddingInlineStart: 0
    },
    [`&.${accordionClasses.disabled}, &.${accordionClasses.expanded}`]: {
      backgroundColor: theme.palette.background.paper
    }
  },
  attributesList: {
    overflow: 'auto',
    maxHeight: 250,
    background: 'white',
    width: '100%',
    position: 'relative',
    [`.${listSubheaderClasses.root}`]: {
      top: -10
    },
    'li > ul': {
      overflow: 'initial'
    }
  },
  limitBar: { backgroundColor: theme.palette.grey[500], margin: '15px 0' },
  summary: { padding: 0, marginBottom: theme.spacing() }
}));

export const ReportingLimits = ({ getReportingLimits, config = {} }) => {
  const [open, setOpen] = useState(false);
  const { classes } = useStyles();
  const { attributes = {}, count = 0, limit = 100 } = config;

  useEffect(() => {
    getReportingLimits();
  }, []);

  const toggleOpen = () => setOpen(toggle);

  return (
    <OrganizationSettingsItem
      title={
        <div className="flexbox center-aligned">
          <div className="margin-right-small">Filterable attributes usage & limit</div>
          <MenderTooltipClickable
            className="flexbox center-aligned"
            disableHoverListener={false}
            placement="top"
            title={
              <div style={{ maxWidth: 350 }}>
                Expand to see the list of attributes currently in use. Please{' '}
                <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
                  contact our team
                </a>{' '}
                if your use case requires a different set of attributes.
              </div>
            }
          >
            <InfoIcon />
          </MenderTooltipClickable>
        </div>
      }
      content={{}}
      secondary={
        <Accordion className={classes.accordion} square expanded={open} onChange={toggleOpen} disabled={!count}>
          <AccordionSummary className={classes.summary}>
            <LinearProgress className={classes.limitBar} variant="determinate" value={(count * 100) / limit} style={{ width: '100%' }} />
            <IconButton className="margin-left-small expandButton" size="large">
              {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <List className={classes.attributesList}>
              {Object.entries(attributes).map(([scope, values = []]) => (
                <li key={scope}>
                  <ul>
                    <ListSubheader>{scope}</ListSubheader>
                    {values.map(item => (
                      <ListItem key={`item-${scope}-${item}`}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </ul>
                </li>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      }
    />
  );
};

const actionCreators = { getReportingLimits };

const mapStateToProps = state => {
  return {
    config: state.devices.filteringAttributesConfig
  };
};

export default connect(mapStateToProps, actionCreators)(ReportingLimits);
