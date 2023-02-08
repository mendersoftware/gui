import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Clear as ClearIcon, Settings, Square } from '@mui/icons-material';
import { IconButton, LinearProgress, linearProgressClasses, svgIconClasses } from '@mui/material';
import { useTheme } from '@mui/styles';
import { makeStyles } from 'tss-react/mui';

import { VictoryBar, VictoryPie, VictoryStack } from 'victory';

import { chartTypes } from '../../../constants/appConstants';
import { ALL_DEVICES } from '../../../constants/deviceConstants';
import { softwareTitleMap } from '../../../constants/releaseConstants';
import { toggle } from '../../../helpers';
import { chartColorPalette } from '../../../themes/Mender';
import Loader from '../../common/loader';
import { ChartEditWidget, RemovalWidget } from './chart-addition';

const seriesOther = '__OTHER__';

const createColorClassName = hexColor => `color-${hexColor.slice(1)}`;

const useStyles = makeStyles()(theme => ({
  header: { minHeight: 30, [`.${svgIconClasses.root}`]: { marginLeft: theme.spacing() } },
  indicator: { fontSize: 10, minWidth: 'initial', marginLeft: 4 },
  legendItem: {
    alignItems: 'center',
    display: 'grid',
    gridTemplateColumns: '1fr max-content',
    columnGap: theme.spacing(2),
    '&.indicating': {
      gridTemplateColumns: 'min-content 1fr max-content',
      columnGap: theme.spacing()
    }
  },
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    columnGap: theme.spacing(2),
    marginBottom: 15,
    '&>.flexbox.column > *': {
      height: 20
    },
    '.barchart': {
      [`.${linearProgressClasses.root}`]: {
        backgroundColor: theme.palette.grey[400]
      },
      ...Object.values(chartColorPalette).reduce(
        (accu, color) => ({
          ...accu,
          [`.${createColorClassName(color)} .${linearProgressClasses.barColorPrimary}`]: { backgroundColor: color }
        }),
        {
          [`.${createColorClassName(theme.palette.grey[400])} .${linearProgressClasses.barColorPrimary}`]: { backgroundColor: theme.palette.grey[400] }
        }
      )
    }
  }
}));

const ChartLegend = ({ classes, data, events = [], showIndicators = true }) => {
  const { eventHandlers = {} } = events[0];
  const { onClick } = eventHandlers;
  return (
    <div className="flexbox column">
      {data.map(({ fill, x, title, tip, value }) => (
        <div
          className={`clickable ${classes.legendItem} ${showIndicators ? 'indicating' : ''}`}
          key={x}
          onClick={e => onClick(e, { datum: { x } })}
          title={tip}
        >
          {showIndicators && <Square className={classes.indicator} style={{ fill }} />}
          <div className="text-overflow">{title}</div>
          <div>{value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

const VictoryBarChart = ({ data, totals, ...remainder }) => (
  <VictoryStack {...remainder} animate={{ duration: 700, onLoad: { duration: 700 } }} horizontal padding={{ left: 0, right: 0, top: 0, bottom: 15 }}>
    <VictoryBar alignment="start" barWidth={16} sortKey={['y']} sortOrder="ascending" data={data} />
    <VictoryBar alignment="start" barWidth={16} sortKey={['y']} sortOrder="descending" data={totals} />
  </VictoryStack>
);

const BarChart = ({ data, events }) => {
  const [chartData, setChartData] = useState([]);
  const timer = useRef();

  useEffect(() => {
    setChartData(data.map(item => ({ ...item, y: 0 })));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setChartData(data), 700);
    return () => {
      clearTimeout(timer.current);
    };
  }, [JSON.stringify(data)]);

  const { eventHandlers = {} } = events[0];
  const { onClick } = eventHandlers;
  return (
    <div className="flexbox column">
      {chartData.map(({ fill, x, y, tip }) => (
        <div className="clickable flexbox column barchart" key={x} onClick={e => onClick(e, { datum: { x } })} title={tip} style={{ justifyContent: 'center' }}>
          <LinearProgress className={createColorClassName(fill)} variant="determinate" value={y} style={{ height: 8 }} />
        </div>
      ))}
    </div>
  );
};

const ChartContainer = ({ className, children }) => <div className={className}>{children}</div>;

const BarChartContainer = ({ classes = {}, data, events, ...remainder }) => (
  <ChartContainer className={classes.wrapper}>
    <ChartLegend classes={classes} data={data} events={events} showIndicators={false} />
    <BarChart {...remainder} data={data} events={events} />
  </ChartContainer>
);

const PieChart = props => <VictoryPie {...props} padding={{ left: 0, right: 0, top: 0, bottom: 15 }} />;

const PieChartContainer = ({ classes = {}, ...chartProps }) => (
  <ChartContainer className={classes.wrapper}>
    <ChartLegend {...chartProps} classes={classes} />
    <PieChart {...chartProps} />
  </ChartContainer>
);

const VictoryBarChartContainer = ({ classes = {}, ...chartProps }) => (
  <ChartContainer className={classes.wrapper}>
    <ChartLegend {...chartProps} classes={classes} />
    <VictoryBarChart {...chartProps} />
  </ChartContainer>
);

const chartTypeComponentMap = {
  [chartTypes.bar.key]: BarChartContainer,
  [`${chartTypes.bar.key}-alternative`]: VictoryBarChartContainer,
  [chartTypes.pie.key]: PieChartContainer
};

const initDistribution = ({ attribute, group, groups, devices, theme }) => {
  const relevantDevices = group && groups[group] ? groups[group].deviceIds.map(id => devices[id]) : Object.values(devices);
  const distributionByAttributeId = relevantDevices.reduce((accu, item) => {
    if (!item.attributes || item.status !== 'accepted') return accu;
    if (!accu[item.attributes[attribute]]) {
      accu[item.attributes[attribute]] = 0;
    }
    accu[item.attributes[attribute]] = accu[item.attributes[attribute]] + 1;
    return accu;
  }, {});
  const distributionByAttribute = Object.entries(distributionByAttributeId);
  const total = distributionByAttribute.reduce((prev, [, item]) => prev + item, 0);
  const numberOfItems = distributionByAttribute.length > chartColorPalette.length ? chartColorPalette.length - 1 : distributionByAttribute.length;
  const colors = chartColorPalette.slice(0, numberOfItems).reverse();
  let distribution = distributionByAttribute.slice(0, colors.length).reduce(
    (accu, [key, value], index) => [
      {
        x: key || '-',
        y: (value / total) * 100, //value,
        title: key || '-',
        tip: key || '-',
        fill: chartColorPalette[index],
        value
      },
      ...accu
    ],
    []
  );
  if (distributionByAttribute.length > chartColorPalette.length) {
    const others = distributionByAttribute.slice(colors.length).reduce((accu, [, value]) => accu + value, 0);
    distribution.splice(0, 0, {
      x: seriesOther,
      title: 'Other',
      tip: seriesOther,
      y: (others / total) * 100,
      fill: chartColorPalette[chartColorPalette.length - 1],
      value: others
    });
  }
  distribution.sort((pairA, pairB) => pairB.y - pairA.y);
  // y: formatValue(item.y, total)
  const totals = distribution.map(({ x, y }) => ({ value: total, x, y: 100 - y, fill: theme.palette.grey[400] }));
  return { distribution, totals };
};

export const Header = ({ chartType }) => {
  const { classes } = useStyles();
  const { Icon } = chartTypes[chartType];
  return (
    <div className={`flexbox center-aligned ${classes.header}`}>
      Software distribution
      <Icon />
    </div>
  );
};

export const DistributionReport = ({ devices, groups, onClick, onSave, selectGroup, selection = {}, software: softwareTree }) => {
  const {
    attribute: attributeSelection,
    group: groupSelection = '',
    chartType: chartTypeSelection = chartTypes.bar.key,
    software: softwareSelection = 'rootfs-image.version'
  } = selection;
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [chartType, setChartType] = useState(chartTypes.bar.key);
  const [software, setSoftware] = useState('');
  const [group, setGroup] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setSoftware(softwareSelection || attributeSelection);
    setGroup(groupSelection);
    setChartType(chartTypeSelection);
  }, [attributeSelection, groupSelection, chartTypeSelection, softwareSelection]);

  const { distribution, totals } = useMemo(
    () => initDistribution({ attribute: attributeSelection, devices, group, groups, theme }),
    [attributeSelection, group, JSON.stringify(groups), groups[group]?.deviceIds.length]
  );

  const onSliceClick = (e, { datum: { x: thing } }) => {
    if (thing === seriesOther) {
      return;
    }
    const groupFilters = groups[group]?.filters?.length ? groups[group].filters : [];
    const filters = [...groupFilters, { key: attributeSelection, value: thing, operator: '$eq', scope: 'inventory' }];
    selectGroup(group, filters);
    navigate(`/devices?${group ? `group=${group}&` : ''}${attributeSelection}=${thing}`);
  };

  const toggleRemoving = () => setRemoving(toggle);

  const onToggleEditClick = () => setEditing(toggle);

  const onSaveClick = selection => {
    setChartType(selection.chartType);
    setSoftware(selection.software);
    setGroup(selection.group);
    onSave(selection);
    setEditing(false);
  };

  const Chart = chartTypeComponentMap[chartType];
  const { classes } = useStyles();
  const chartProps = {
    classes,
    data: distribution,
    domainPadding: 0,
    events: [{ target: 'data', eventHandlers: { onClick: onSliceClick } }],
    standalone: true,
    style: { data: { fill: ({ datum }) => datum.fill } },
    labels: () => null
  };
  return removing ? (
    <RemovalWidget onCancel={toggleRemoving} onClick={onClick} />
  ) : editing ? (
    <ChartEditWidget
      groups={groups}
      onSave={onSaveClick}
      onCancel={onToggleEditClick}
      selection={{ ...selection, chartType, group, software }}
      software={softwareTree}
    />
  ) : (
    <div className="widget chart-widget">
      <div className="margin-bottom-small">
        <div className="flexbox space-between margin-bottom-small">
          <Header chartType={chartType} />
          <div className="flexbox center-aligned" style={{ zIndex: 1 }}>
            <IconButton onClick={onToggleEditClick} size="small">
              <Settings fontSize="small" />
            </IconButton>
            <IconButton onClick={toggleRemoving} size="small">
              <ClearIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        <div className="flexbox space-between slightly-smaller">
          <div>{softwareTitleMap[software] ? softwareTitleMap[software].title : software}</div>
          <div>{group || ALL_DEVICES}</div>
        </div>
      </div>
      {distribution.length ? (
        <Chart {...chartProps} totals={totals} />
      ) : groups[group]?.filters.length && !groups[group]?.deviceIds.length ? (
        <div className="muted flexbox centered">No devices are part of this group.</div>
      ) : (
        <Loader show={true} />
      )}
    </div>
  );
};

export default DistributionReport;
