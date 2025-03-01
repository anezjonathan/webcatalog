import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import StatedMenu from '../../shared/stated-menu';

import connectComponent from '../../../helpers/connect-component';

import { getInstallingAppsAsList, getAppCount } from '../../../state/app-management/utils';

import { open as openDialogSetInstallationPath } from '../../../state/dialog-set-installation-path/actions';

import {
  requestOpenInBrowser,
  requestResetPreferences,
  requestSetPreference,
  requestShowMessageBox,
  requestOpenInstallLocation,
} from '../../../senders';

const { remote } = window.require('electron');

const styles = (theme) => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  title: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: theme.spacing.unit * 2,
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  sectionTitle: {
    paddingLeft: theme.spacing.unit * 2,
  },
  paper: {
    marginTop: theme.spacing.unit * 0.5,
    marginBottom: theme.spacing.unit * 3,
    width: '100%',
  },
  inner: {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
  },
  switchBase: {
    height: 'auto',
  },
});

const getThemeString = (theme) => {
  if (theme === 'light') return 'Light';
  if (theme === 'dark') return 'Dark';
  return 'Automatic';
};


const getEngineName = (engine) => {
  switch (engine) {
    case 'electron': {
      return 'Electron';
    }
    case 'firefox': {
      return 'Mozilla Firefox';
    }
    case 'chromium': {
      return 'Chromium';
    }
    default:
    case 'chrome': {
      return 'Google Chrome';
    }
  }
};

const Preferences = ({
  appCount,
  classes,
  hideEnginePrompt,
  installationPath,
  installingAppCount,
  onOpenDialogSetInstallationPath,
  preferredEngine,
  requireAdmin,
  theme,
}) => {
  const handleUpdateInstallationPath = (newInstallationPath, newRequireAdmin) => {
    if (appCount > 0) {
      remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        title: 'Uninstall all of WebCatalog apps first',
        message: 'You need to uninstall all of your WebCatalog apps before updating this preference.',
      });
    } else {
      requestSetPreference('requireAdmin', newRequireAdmin);
      requestSetPreference('installationPath', newInstallationPath);
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar} elevation={2}>
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" className={classes.title}>
            Preferences
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.scrollContainer}>
        <div className={classes.inner}>
          <Typography variant="subtitle2" className={classes.sectionTitle}>
            Engine
          </Typography>
          <Paper className={classes.paper}>
            <List dense>
              <StatedMenu
                id="preferredEngine"
                buttonElement={(
                  <ListItem button>
                    <ListItemText primary="Preferred engine" secondary={getEngineName(preferredEngine)} />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                )}
              >
                <MenuItem onClick={() => requestSetPreference('preferredEngine', 'chrome')}>Google Chrome (recommend)</MenuItem>
                <MenuItem onClick={() => requestSetPreference('preferredEngine', 'chromium')}>Chromium</MenuItem>
                <MenuItem onClick={() => requestSetPreference('preferredEngine', 'electron')}>Electron (recommend)</MenuItem>
                <MenuItem onClick={() => requestSetPreference('preferredEngine', 'firefox')}>Mozilla Firefox</MenuItem>
              </StatedMenu>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Ask for engine selection before every installation"
                />
                <Switch
                  checked={!hideEnginePrompt}
                  onChange={(e) => {
                    requestSetPreference('hideEnginePrompt', !e.target.checked);
                  }}
                  classes={{
                    switchBase: classes.switchBase,
                  }}
                />
              </ListItem>
            </List>
          </Paper>

          <Typography variant="subtitle2" className={classes.sectionTitle}>
            Appearance
          </Typography>
          <Paper className={classes.paper}>
            <List dense>
              <StatedMenu
                id="theme"
                buttonElement={(
                  <ListItem button>
                    <ListItemText primary="Theme" secondary={getThemeString(theme)} />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                )}
              >
                {window.process.platform === 'darwin' && (
                  <MenuItem onClick={() => requestSetPreference('theme', 'automatic')}>Automatic</MenuItem>
                )}
                <MenuItem onClick={() => requestSetPreference('theme', 'light')}>Light</MenuItem>
                <MenuItem onClick={() => requestSetPreference('theme', 'dark')}>Dark</MenuItem>
              </StatedMenu>
            </List>
          </Paper>

          <Typography variant="subtitle2" className={classes.sectionTitle}>
            Privacy &amp; Security
          </Typography>
          <Paper className={classes.paper}>
            <List dense>
              <ListItem button onClick={() => requestOpenInBrowser('https://getwebcatalog.com/privacy')}>
                <ListItemText primary="Privacy Policy" />
              </ListItem>
            </List>
          </Paper>

          <Typography variant="subtitle2" className={classes.sectionTitle}>
            Advanced
          </Typography>
          <Paper className={classes.paper}>
            <List dense>
              {installingAppCount > 0 ? (
                <ListItem
                  button
                  onClick={() => {
                    requestShowMessageBox('This preference cannot be changed when installing or updating apps.');
                  }}
                >
                  <ListItemText primary="Installation path" secondary={`${installationPath} ${requireAdmin ? '(require sudo)' : ''}`} />
                  <ChevronRightIcon color="action" />
                </ListItem>
              ) : (
                <StatedMenu
                  id="installLocation"
                  buttonElement={(
                    <ListItem button>
                      <ListItemText primary="Installation path" secondary={`${installationPath} ${requireAdmin ? '(require sudo)' : ''}`} />
                      <ChevronRightIcon color="action" />
                    </ListItem>
                  )}
                >
                  {(installationPath !== '~/Applications/WebCatalog Apps' && installationPath !== '/Applications/WebCatalog Apps') && (
                    <MenuItem>
                      {installationPath}
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      handleUpdateInstallationPath('~/Applications/WebCatalog Apps', false);
                    }}
                  >
                    ~/Applications/WebCatalog Apps (default)
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleUpdateInstallationPath('/Applications/WebCatalog Apps', true);
                    }}
                  >
                    /Applications/WebCatalog Apps (requires sudo)
                  </MenuItem>
                  <MenuItem onClick={onOpenDialogSetInstallationPath}>
                    Custom
                  </MenuItem>
                </StatedMenu>
              )}
              <Divider />
              <ListItem button onClick={requestOpenInstallLocation}>
                <ListItemText primary="Open installation path in Finder" />
              </ListItem>
            </List>
          </Paper>

          <Typography variant="subtitle2" className={classes.sectionTitle}>
            Reset
          </Typography>
          <Paper className={classes.paper}>
            <List dense>
              <ListItem button onClick={requestResetPreferences}>
                <ListItemText primary="Restore preferences to their original defaults" />
                <ChevronRightIcon color="action" />
              </ListItem>
            </List>
          </Paper>
        </div>
      </div>
    </div>
  );
};

Preferences.propTypes = {
  appCount: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  hideEnginePrompt: PropTypes.bool.isRequired,
  installationPath: PropTypes.string.isRequired,
  installingAppCount: PropTypes.number.isRequired,
  onOpenDialogSetInstallationPath: PropTypes.func.isRequired,
  preferredEngine: PropTypes.string.isRequired,
  requireAdmin: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  appCount: getAppCount(state),
  hideEnginePrompt: state.preferences.hideEnginePrompt,
  installationPath: state.preferences.installationPath,
  installingAppCount: getInstallingAppsAsList(state).length,
  preferredEngine: state.preferences.preferredEngine,
  requireAdmin: state.preferences.requireAdmin,
  theme: state.preferences.theme,
});

const actionCreators = {
  openDialogSetInstallationPath,
};

export default connectComponent(
  Preferences,
  mapStateToProps,
  actionCreators,
  styles,
);
