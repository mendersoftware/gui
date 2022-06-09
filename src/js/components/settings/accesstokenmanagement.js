import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';

// material ui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { generateToken, getTokens, revokeToken } from '../../actions/userActions';
import { customSort } from '../../helpers';
import { getCurrentUser, getTenantCapabilities } from '../../selectors';
import Time, { RelativeTime } from '../common/time';
import CopyCode from '../common/copy-code';

const useStyles = makeStyles()(() => ({
  accessTokens: {
    minWidth: 900
  },
  creationDialog: {
    minWidth: 500
  },
  formEntries: {
    minWidth: 270
  }
}));

const creationTimeAttribute = 'created_ts';
const columnData = [
  { id: 'token', label: 'Token', canShow: () => true, render: ({ token }) => token.name },
  { id: creationTimeAttribute, label: 'Date created', canShow: () => true, render: ({ token }) => <Time value={token[creationTimeAttribute]} /> },
  {
    id: 'expiration_date',
    label: 'Expires',
    canShow: () => true,
    render: ({ token }) => <RelativeTime updateTime={token.expiration_date} shouldCount="up" />
  },
  {
    id: 'last_used',
    label: 'Last used',
    canShow: ({ hasLastUsedInfo }) => hasLastUsedInfo,
    render: ({ token }) => <RelativeTime updateTime={token.last_used} />
  },
  {
    id: 'actions',
    label: 'Manage',
    canShow: () => true,
    render: ({ onRevokeTokenClick, token }) => <Button onClick={() => onRevokeTokenClick(token)}>Revoke</Button>
  }
];

const A_DAY = 24 * 60 * 60;
const expirationTimes = {
  '7 days': 7 * A_DAY,
  '30 days': 30 * A_DAY,
  '90 days': 90 * A_DAY,
  'a year': 365 * A_DAY
};

export const AccessTokenCreationDialog = ({ onCancel, generateToken, isEnterprise, rolesById, setToken, token, userRoles }) => {
  const [name, setName] = useState('');
  const [expirationTime, setExpirationTime] = useState(expirationTimes['a year']);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const { classes } = useStyles();

  useEffect(() => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + expirationTime);
    setExpirationDate(date);
  }, [expirationTime]);

  const onGenerateClick = useCallback(
    () => generateToken({ name, expiresIn: expirationTime }).then(results => setToken(results[results.length - 1])),
    [name, expirationTime]
  );

  const onChangeExpirationTime = ({ target: { value } }) => setExpirationTime(value);

  const generationHandler = token ? onCancel : onGenerateClick;

  const generationLabel = token ? 'Close' : 'Create token';

  const nameUpdated = ({ target: { value } }) => setName(value);

  const tokenRoles = useMemo(() => userRoles.map(roleId => rolesById[roleId]?.name).join(', '), [rolesById, userRoles]);

  return (
    <Dialog open>
      <DialogTitle>Create new token</DialogTitle>
      <DialogContent className={classes.creationDialog}>
        <form>
          <TextField className={`${classes.formEntries} required`} disabled={!!token} onChange={nameUpdated} placeholder="Name" value={name} />
        </form>
        <div>
          <FormControl className={classes.formEntries}>
            <InputLabel>Expiration</InputLabel>
            <Select disabled={!!token} onChange={onChangeExpirationTime} value={expirationTime}>
              {Object.entries(expirationTimes).map(([title, value]) => (
                <MenuItem key={value} value={value}>
                  {title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText title={expirationDate.toISOString().slice(0, 10)}>
              expires on <Time format="YYYY-MM-DD" value={expirationDate} />
            </FormHelperText>
          </FormControl>
        </div>
        {token && (
          <div className="margin-top margin-bottom">
            <CopyCode code={token} />
            <p className="warning">This is the only time you will be able to see the token, so make sure to store it in a safe place.</p>
          </div>
        )}
        {isEnterprise && (
          <FormControl className={classes.formEntries}>
            <TextField label="Permission level" id="role-name" value={tokenRoles} disabled />
            <FormHelperText>The token will have the same permissions as your user</FormHelperText>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        {!token && <Button onClick={onCancel}>Cancel</Button>}
        <Button disabled={!name.length} variant="contained" onClick={generationHandler}>
          {generationLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const AccessTokenRevocationDialog = ({ onCancel, revokeToken, token }) => (
  <Dialog open>
    <DialogTitle>Revoke token</DialogTitle>
    <DialogContent>
      Are you sure you want to revoke the token <b>{token?.name}</b>?
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={() => revokeToken(token)}>Revoke Token</Button>
    </DialogActions>
  </Dialog>
);

export const AccessTokenManagement = ({ generateToken, getTokens, revokeToken, isEnterprise, rolesById, tokens = [], userRoles = [] }) => {
  const [showGeneration, setShowGeneration] = useState(false);
  const [showRevocation, setShowRevocation] = useState(false);
  const [currentToken, setCurrentToken] = useState(null);

  const { classes } = useStyles();

  useEffect(() => {
    getTokens();
  }, []);

  const toggleGenerateClick = () => {
    setCurrentToken(null);
    setShowGeneration(!showGeneration);
  };

  const toggleRevocationClick = () => {
    setCurrentToken(null);
    setShowRevocation(!showRevocation);
  };

  const onRevokeClick = token => revokeToken(token).then(() => toggleRevocationClick());

  const onRevokeTokenClick = token => {
    toggleRevocationClick();
    setCurrentToken(token);
  };

  const hasLastUsedInfo = useMemo(() => tokens.some(token => !!token.last_used), [tokens]);

  const columns = useMemo(
    () =>
      columnData.reduce((accu, column) => {
        if (!column.canShow({ hasLastUsedInfo })) {
          return accu;
        }
        accu.push(column);
        return accu;
      }, []),
    [hasLastUsedInfo]
  );

  return (
    <>
      <div className={`flexbox space-between margin-top ${tokens.length ? classes.accessTokens : ''}`}>
        <p className="help-content">Personal access token management</p>
        <Button onClick={toggleGenerateClick}>Generate a token</Button>
      </div>
      {!!tokens.length && (
        <Table className={classes.accessTokens}>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.id} padding={column.disablePadding ? 'none' : 'normal'}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.sort(customSort(true, creationTimeAttribute)).map(token => (
              <TableRow key={token.id} hover>
                {columns.map(column => (
                  <TableCell key={column.id}>{column.render({ onRevokeTokenClick, token })}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {showGeneration && (
        <AccessTokenCreationDialog
          onCancel={toggleGenerateClick}
          generateToken={generateToken}
          isEnterprise={isEnterprise}
          rolesById={rolesById}
          setToken={setCurrentToken}
          token={currentToken}
          userRoles={userRoles}
        />
      )}
      {showRevocation && <AccessTokenRevocationDialog onCancel={toggleRevocationClick} revokeToken={onRevokeClick} token={currentToken} />}
    </>
  );
};

const actionCreators = { generateToken, getTokens, revokeToken };

const mapStateToProps = state => {
  const { isEnterprise } = getTenantCapabilities(state);
  const { tokens, roles: userRoles } = getCurrentUser(state);
  return {
    isEnterprise,
    rolesById: state.users.rolesById,
    tokens,
    userRoles
  };
};

export default connect(mapStateToProps, actionCreators)(AccessTokenManagement);
