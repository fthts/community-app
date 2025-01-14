/**
 * A block that fetches and renders a job details page
 * driven by recruitCRM
 */

import { isEmpty } from 'lodash';
import actions from 'actions/recruitCRM';
import LoadingIndicator from 'components/LoadingIndicator';
import GigDetails from 'components/Gigs/GigDetails';
import PT from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { config } from 'topcoder-react-utils';
import fetch from 'isomorphic-fetch';
import RecruitCRMJobApply from './RecruitCRMJobApply';

const PROXY_ENDPOINT = `${config.URL.COMMUNITY_APP}/api`;

class RecruitCRMJobDetailsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isReferrSucess: false,
      formErrors: {},
      formData: {
        body: `Hey there!

Topcoder has a freelance gig that I thought you would be interested in. If you get the gig, I could earn cash!
        
Check it out:
${config.URL.BASE}${config.GIGS_PAGES_PATH}/${props.id}`,
      },
    };

    this.onSendClick = this.onSendClick.bind(this);
    this.onReferralDone = this.onReferralDone.bind(this);
  }

  componentDidMount() {
    const {
      getJob,
      id,
      job,
    } = this.props;

    if (isEmpty(job)) {
      getJob(id);
    }
  }

  /**
   * Send gig referral invite
   */
  async onSendClick(email) {
    const { profile, growSurf } = this.props;
    const { formData } = this.state;
    // email the invite
    const res = await fetch(`${PROXY_ENDPOINT}/mailchimp/email`, {
      method: 'POST',
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: `${profile.firstName} ${profile.lastName} Thinks This Topcoder Gig Is For You!`,
          },
        ],
        from: { email: 'noreply@topcoder.com', name: `${profile.firstName} ${profile.lastName} via Topcoder Gigwork` },
        content: [{
          type: 'text/plain', value: `${formData.body}?referralId=${growSurf.data.id}`,
        }],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
    });
    if (res.status >= 300) {
      this.setState({
        isReferrError: await res.json(),
      });
    } else {
      this.setState({
        isReferrSucess: true,
      });
    }
  }

  /**
   * Reset the form when referral done
   */
  onReferralDone() {
    const { formData } = this.state;
    delete formData.email;
    this.setState({
      isReferrSucess: false,
      formData,
    });
  }

  render() {
    const {
      loading,
      job,
      isApply,
      application,
      profile,
      growSurf,
    } = this.props;
    const {
      formErrors,
      formData,
      isReferrSucess,
      isReferrError,
      // referralId,
    } = this.state;

    if (loading) {
      return <LoadingIndicator />;
    }

    return isApply
      ? <RecruitCRMJobApply job={job} />
      : (
        <GigDetails
          job={job}
          application={application}
          profile={profile}
          onSendClick={this.onSendClick}
          isReferrSucess={isReferrSucess}
          formErrors={formErrors}
          formData={formData}
          isReferrError={isReferrError}
          onReferralDone={this.onReferralDone}
          growSurf={growSurf}
        />
      );
  }
}

RecruitCRMJobDetailsContainer.defaultProps = {
  job: {},
  application: null,
  profile: {},
  growSurf: {},
};

RecruitCRMJobDetailsContainer.propTypes = {
  getJob: PT.func.isRequired,
  loading: PT.bool.isRequired,
  job: PT.shape(),
  id: PT.string.isRequired,
  isApply: PT.bool.isRequired,
  application: PT.shape(),
  profile: PT.shape(),
  growSurf: PT.shape(),
};

function mapStateToProps(state, ownProps) {
  const data = state.recruitCRM[ownProps.id];
  const profile = state.auth && state.auth.profile ? { ...state.auth.profile } : {};
  const { growSurf } = state;
  return {
    job: data ? data.job : {},
    loading: data ? data.loading : true,
    application: data ? data.application : null,
    profile,
    growSurf,
  };
}

function mapDispatchToActions(dispatch) {
  const a = actions.recruit;
  return {
    getJob: (id) => {
      dispatch(a.getJobInit(id));
      dispatch(a.getJobDone(id));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToActions,
)(RecruitCRMJobDetailsContainer);
