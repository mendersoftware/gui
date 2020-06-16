import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import ReCAPTCHA from 'react-google-recaptcha';

import { setSnackbar } from '../../actions/appActions';
import { createOrganizationTrial } from '../../actions/organizationActions';
import { loginUser } from '../../actions/userActions';

import Form from '../common/forms/form';
import Loader from '../common/loader';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormCheckbox from '../common/forms/formcheckbox';
import { WelcomeSnackTip } from '../helptips/onboardingtips';
import { getOnboardingStepCompleted } from '../../utils/onboardingmanager';

export class Signup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      step: props.step || 1,
      email: '',
      loading: false,
      password: '',
      password_confirmation: '',
      name: '',
      tos: '',
      marketing: '',
      recaptcha: ''
    };
  }

  _handleStep1(formData) {
    if (formData.password_new != formData.password_confirmation) {
      this.props.setSnackbar('The passwords you provided do not match, please check again.', 5000, '');
      return;
    }
    this.setState({
      email: formData.email,
      password: formData.password_new,
      password_confirmation: formData.password_confirmation,
      step: 2
    });
  }

  _handleSignup(formData) {
    if (this.props.recaptchaSiteKey !== '' && this.state.recaptcha === '') {
      this.props.setSnackbar('Please complete the reCAPTCHA test before proceeding!', 5000, '');
      return;
    }
    this.setState({
      name: formData.name,
      tos: formData.tos,
      marketing: formData.marketing,
      loading: true
    });
    const signup = {
      email: this.state.email,
      password: this.state.password,
      organization: formData.name,
      plan: 'enterprise',
      tos: formData.tos,
      marketing: formData.marketing,
      'g-recaptcha-response': this.state.recaptcha || 'empty'
    };
    return this.props
      .createOrganizationTrial(signup)
      .catch(err => {
        if (err.error.status >= 400 && err.error.status < 500) {
          this.setState({ step: 1, recaptcha: '' });
          this.props.setSnackbar(err.error.response.body.error, 5000, '');
        }
      })
      .then(res => {
        if (typeof res !== 'undefined') {
          setTimeout(() => {
            this.props.loginUser({
              email: this.state.email,
              password: this.state.password
            });
            this.setState({ loading: false });
          }, 3000);
        }
      })
      .finally(() => setTimeout(() => this.setState({ loading: false }), 3200));
  }

  _recaptchaOnChange(value) {
    this.setState({ recaptcha: value });
  }

  componentDidUpdate() {
    const self = this;
    if (this.props.currentUser.id) {
      self.setState({ redirectToReferrer: true });
      setTimeout(() => {
        if (
          self.props.showHelptips &&
          self.props.showOnboardingTips &&
          !self.props.onboardingComplete &&
          !getOnboardingStepCompleted('devices-pending-accepting-onboarding')
        ) {
          self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={1} />, () => {}, self.onCloseSnackbar);
        }
      }, 1000);
      self.props.setSnackbar('');
    }
  }

  render() {
    const self = this;
    const { step, email, loading, password, password_confirmation, name, tos, marketing, redirectToReferrer } = this.state;
    const { isHosted } = this.props;
    let { from } = { from: { pathname: '/' } };
    if (location && location.state && location.state.from.pathname !== '/ui/') {
      from = location.state.from;
    }
    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }
    return (
      <div className="full-screen">
        <div id="signup-box">
          {loading ? (
            <Loader show={true} style={{ display: 'flex' }} />
          ) : (
            <>
              {step == 1 && (
                <>
                  <h1>Try Mender for Free</h1>
                  <h2 className="margin-bottom-large">
                    Sign up and connect up to 10 devices
                    <br />
                    free for 12 months
                  </h2>
                  <Form
                    showButtons={true}
                    buttonColor="primary"
                    onSubmit={formdata => self._handleStep1(formdata)}
                    submitLabel="Sign up"
                    submitButtonId="login_button"
                  >
                    <TextInput hint="Email *" label="Email *" id="email" required={true} validations="isLength:1,isEmail" value={email} />
                    <PasswordInput id="password_new" label="Password *" validations="isLength:8" required={true} value={password} />
                    <PasswordInput
                      id="password_confirmation"
                      label="Confirm password *"
                      validations="isLength:8"
                      required={true}
                      value={password_confirmation}
                    />
                  </Form>
                </>
              )}
              {step == 2 && (
                <>
                  <h1>Setting up your Account</h1>
                  <h2 className="margin-bottom-large">
                    To finish creating your account,
                    <br />
                    please fill in a few details
                  </h2>
                  <Form
                    showButtons={true}
                    buttonColor="primary"
                    onSubmit={formdata => self._handleSignup(formdata)}
                    submitLabel="Complete signup"
                    submitButtonId="login_button"
                  >
                    <TextInput
                      hint="Company or organization name *"
                      label="Company or organization name *"
                      id="name"
                      required={true}
                      value={name}
                      validations="isLength:1"
                    />
                    <FormCheckbox
                      id="tos"
                      label="By checking this you agree to our Terms of service and Privacy Policy *"
                      required={true}
                      value={'true'}
                      checked={tos === 'true'}
                    />
                    <FormCheckbox
                      id="marketing"
                      label="If you would like to receive occasional email updates about Mender and upcoming features, please consent to us storing your email
address only for this purpose. By checking this box, you agree that we may contact you by email from time tom time.
You can unsubscribe by emailing contact@mender.io"
                      value={'true'}
                      checked={marketing === 'true'}
                    />
                    {self.props.recaptchaSiteKey && (
                      <div className="margin-top">
                        <ReCAPTCHA sitekey={self.props.recaptchaSiteKey} onChange={value => self._recaptchaOnChange(value)} />
                      </div>
                    )}
                  </Form>
                </>
              )}
              {isHosted && (
                <div className="flexbox margin-top" style={{ color: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center' }}>
                  Already have an account?{' '}
                  <Link style={{ marginLeft: '4px' }} to="/login">
                    Log in
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

const actionCreators = { createOrganizationTrial, loginUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    isHosted: state.app.features.isHosted,
    recaptchaSiteKey: state.app.recaptchaSiteKey
  };
};

export default connect(mapStateToProps, actionCreators)(Signup);
