// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import helptooltips from '../../../../assets/img/helptooltips.png';
import { setOnboardingCanceled, setShowDismissOnboardingTipsDialog } from '../../../actions/onboardingActions';

export const ConfirmDismissHelptips = () => {
  const dispatch = useDispatch();
  return (
    <Dialog open={true}>
      <DialogTitle>Dismiss the Getting Started help?</DialogTitle>
      <DialogContent>
        <p>Hide the help tips? You haven&apos;t finished your first update yet.</p>
        <p>You can always show the help again later by selecting the option from the top menu:</p>
        <div className="flexbox centered">
          <img src={helptooltips} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(setShowDismissOnboardingTipsDialog(false))}>Cancel</Button>
        <div style={{ flexGrow: 1 }} />
        <Button variant="contained" color="secondary" onClick={() => dispatch(setOnboardingCanceled())}>
          Yes, hide the help
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDismissHelptips;
