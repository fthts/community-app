/* eslint-disable no-return-assign */
/* eslint-disable max-len */
/**
 * The Gig details component.
 */

import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { isomorphy, Link, config } from 'topcoder-react-utils';
import { PrimaryButton } from 'topcoder-react-ui-kit';
import ReactHtmlParser from 'react-html-parser';
import { getSalaryType, getCustomField } from 'utils/gigs';
import SubscribeMailChimpTag from 'containers/SubscribeMailChimpTag';
import { isValidEmail } from 'utils/tc';
import './style.scss';
import IconFacebook from 'assets/images/icon-facebook.svg';
import IconTwitter from 'assets/images/icon-twitter.svg';
import IconLinkedIn from 'assets/images/icon-linkedIn.svg';
import IconLocation from 'assets/images/icon-location.svg';
import IconMoney from 'assets/images/icon-payment.svg';
import IconDuration from 'assets/images/icon-calendar-gig.svg';
import IconHours from 'assets/images/icon-duration.svg';
import IconTimezone from 'assets/images/icon-timezone.svg';
import iconSkills from 'assets/images/icon-skills-blue.png';
import iconLabel1 from 'assets/images/l1.png';
import iconLabel2 from 'assets/images/l2.png';
import iconLabel3 from 'assets/images/l3.png';
import SadFace from 'assets/images/sad-face-icon.svg';
import ReferralModal from '../ReferralModal';
import LoginModal from '../LoginModal';

// Cleanup HTML from style tags
// so it won't affect other parts of the UI
const ReactHtmlParserOptions = {
  // eslint-disable-next-line consistent-return
  transform: (node) => {
    if (node.type === 'style' && node.name === 'style') {
      return null;
    }
  },
};

function GigDetails(props) {
  const {
    job, application, profile, onSendClick, isReferrSucess, isReferrError, onReferralDone, growSurf,
  } = props;
  let shareUrl;
  let retUrl;
  if (isomorphy.isClientSide()) {
    shareUrl = encodeURIComponent(window.location.href);
    if (growSurf && growSurf.data) {
      shareUrl = `${window.location.origin}${window.location.pathname}?referralId=${growSurf.data.id}`;
    }
    retUrl = `${window.location.origin}${window.location.pathname}/apply${window.location.search}`;
  }
  let skills = getCustomField(job.custom_fields, 'Technologies Required');
  if (skills !== 'n/a') skills = skills.split(',').join(', ');
  const hPerW = getCustomField(job.custom_fields, 'Hours per week');
  const compens = job.min_annual_salary === job.max_annual_salary ? job.max_annual_salary : `${job.min_annual_salary} - ${job.max_annual_salary} (USD)`;

  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [copyBtnText, setCopyBtnText] = useState('COPY');
  const [referrEmail, setreferrEmail] = useState();
  const duration = getCustomField(job.custom_fields, 'Duration');
  let refEmailInput;

  return (
    <div styleName="container">
      {
        job.error || job.job_status.id !== 1 || job.enable_job_application_form !== 1 ? (
          <div styleName="error">
            { job.error ? <SadFace /> : null }
            <h3>{ job.error ? 'Gig does not exist' : 'This Gig has been Fulfilled'}</h3>
            <div styleName="cta-buttons">
              <Link to={config.GIGS_PAGES_PATH}>VIEW OTHER GIGS</Link>
            </div>
          </div>
        ) : (
          <div styleName="wrap">
            <h2>{job.name}</h2>
            <div styleName="infos">
              <div styleName="infos-item">
                <IconLocation />
                <div styleName="infos-data">
                  Location
                  <strong>{job.country}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconMoney />
                <div styleName="infos-data">
                  Compensation
                  <strong>${compens} / {getSalaryType(job.salary_type)}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconDuration />
                <div styleName="infos-data">
                  Duration
                  <strong>{/^\d+$/.test(duration) ? `${duration} Weeks` : duration}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconHours />
                <div styleName="infos-data">
                  Hours
                  <strong>{hPerW === 'n/a' ? hPerW : `${hPerW} hours / week`}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconTimezone />
                <div styleName="infos-data">
                  Working Hours
                  <strong>{getCustomField(job.custom_fields, 'Timezone')}</strong>
                </div>
              </div>
            </div>
            <div styleName="content">
              <div styleName="left">
                <h4>Required Skills</h4>
                <p styleName="skills"><img src={iconSkills} alt="skills-icon" /> {skills}</p>
                <h4>Description</h4>
                <p>{ReactHtmlParser(job.job_description_text, ReactHtmlParserOptions)}
                </p>
                <h4>Notes</h4>
                <div>
                  <strong>
                    * Topcoder does not provide visa sponsorship nor will we work with Staffing Agencies.
                  </strong>
                  <strong>
                    ** USA Visa Holders - Please consult an attorney before applying to any Topcoder Gig. Some visa statuses will or will not allow you to conduct freelance work with Topcoder.
                  </strong>
                  <strong>
                    *** Topcoder and Wipro employees are not eligible for Gig work opportunities. Do not apply and send questions to <a href="mailto:support@topcoder.com">support@topcoder.com</a>.
                  </strong>
                </div>
                <div styleName="cta-buttons">
                  {
                    !application || !application.success ? (
                      <Link
                        styleName="primaryBtn"
                        to={`${config.GIGS_PAGES_PATH}/${job.slug}/apply`}
                        onClick={(e) => {
                          if (isEmpty(profile)) {
                            e.preventDefault();
                            setLoginModalOpen(true);
                          }
                        }}
                      >APPLY TO THIS JOB
                      </Link>
                    ) : null
                  }
                  <Link to={config.GIGS_PAGES_PATH}>VIEW OTHER JOBS</Link>
                </div>
              </div>
              <div styleName="right">
                <div styleName="referr-area">
                  <h6>REFER THIS GIG</h6>
                  {
                    growSurf && growSurf.data ? (
                      <React.Fragment>
                        <span styleName="referralLinkTitile">Share your Referral Link:</span>
                        <input type="text" styleName="referralLink" readOnly value={`https://topcoder.com/gigs/${job.slug}?referralId=${growSurf.data.id}`} />
                        <div styleName="copyAndShare">
                          <PrimaryButton
                            onClick={() => {
                              const copyhelper = document.createElement('input');
                              copyhelper.className = 'copyhelper';
                              document.body.appendChild(copyhelper);
                              copyhelper.value = `https://www.topcoder.com/gigs/${job.slug}?referralId=${growSurf.data.id}`;
                              copyhelper.select();
                              document.execCommand('copy');
                              document.body.removeChild(copyhelper);
                              setCopyBtnText('COPIED');
                              setTimeout(() => {
                                setCopyBtnText('COPY');
                              }, 3000);
                            }}
                          >
                            {copyBtnText}
                          </PrimaryButton>
                          <div styleName="shareButtons">
                            Share on:&nbsp;&nbsp;
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                              <IconLinkedIn />
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&src=share_button`} target="_blank" rel="noopener noreferrer">
                              <IconFacebook />
                            </a>
                            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                              <IconTwitter />
                            </a>
                          </div>
                        </div>
                      </React.Fragment>
                    ) : (
                      <div styleName="shareButtons">
                        Share this job on:&nbsp;&nbsp;
                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                          <IconLinkedIn />
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&src=share_button`} target="_blank" rel="noopener noreferrer">
                          <IconFacebook />
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                          <IconTwitter />
                        </a>
                      </div>
                    )
                  }
                  <div styleName="sepWrap">
                    <div styleName="sepLine" />
                    <span>or</span>
                    <div styleName="sepLine" />
                  </div>
                  <p>Refer someone to this gig and earn $500. Just add their email below. See <Link to="/community/gig-referral" styleName="how-it-works" openNewTab>how it works.</Link></p>
                  <div styleName="referr-form">
                    <input type="email" placeholder="Email" onChange={e => setreferrEmail(e.target.value)} ref={ref => refEmailInput = ref} />
                    <button
                      type="button"
                      onClick={() => {
                        if (!isEmpty(profile) && growSurf.data) {
                          onSendClick(referrEmail);
                          setreferrEmail();
                          refEmailInput.value = '';
                        }
                        setModalOpen(true);
                      }}
                      disabled={!referrEmail || !isValidEmail(referrEmail)}
                    >SEND
                    </button>
                  </div>
                </div>
                <div styleName="subscribe-area">
                  <h6>SUBSCRIBE TO WEEKLY GIG UPDATES</h6>
                  <SubscribeMailChimpTag listId="28bfd3c062" groups={{ d0c48e9da3: true }} />
                </div>
                <div styleName="info-area">
                  <p>At Topcoder, we pride ourselves in bringing our customers the very best candidates to help fill their needs. Want to improve your chances? You can do a few things:</p>
                  <ul>
                    <li>
                      <img src={iconLabel1} alt="label 1" />
                      <div><strong>Make sure your <a target="_blank" rel="noreferrer" href="/settings/profile">Topcoder profile</a> says it all.</strong> Fill out your profile to the best of your ability. Your skills, your location, your devices, etc, all help you improve your chances of being selected for a gig.</div>
                    </li>
                    <li>
                      <img src={iconLabel2} alt="label 2" />
                      <div><strong>Let us know you’re here!</strong> Check in on our <a target="_blank" rel="noreferrer" href={`${config.URL.FORUMS_VANILLA}/categories/gig-work-discusssions`}>Gig Work forum</a> and tell us you’re looking for a gig. It’s great visibility for the Gig team.</div>
                    </li>
                    <li>
                      <img src={iconLabel3} alt="label 3" />
                      <div><strong>Check out our <a target="_blank" rel="noreferrer" href="/challenges">Topcoder challenges</a> and participate.</strong> Challenges showing your technology skills make you a “qualified” candidate so we know you’re good. The proof is in the pudding!</div>
                    </li>
                  </ul>
                </div>
                <div styleName="support">If you have any questions or doubts, don’t hesitate  to email <a href="mailto:support@topcoder.com">support@topcoder.com</a>.</div>
                <div styleName="referral">
                  {
                    isModalOpen
                    && (
                    <ReferralModal
                      profile={profile}
                      onCloseButton={() => setModalOpen(false)}
                      isReferrSucess={isReferrSucess}
                      isReferrError={isReferrError}
                      referralId={growSurf && growSurf.data ? growSurf.data.id : null}
                      onReferralDone={() => {
                        onReferralDone();
                        setModalOpen(false);
                      }}
                    />
                    )
                  }
                </div>
                {
                  isLoginModalOpen && <LoginModal retUrl={retUrl} onCancel={() => setLoginModalOpen(false)} />
                }
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

GigDetails.defaultProps = {
  application: null,
  profile: {},
  growSurf: {},
  isReferrError: null,
};

GigDetails.propTypes = {
  job: PT.shape().isRequired,
  application: PT.shape(),
  profile: PT.shape(),
  onSendClick: PT.func.isRequired,
  isReferrSucess: PT.bool.isRequired,
  isReferrError: PT.shape(),
  onReferralDone: PT.func.isRequired,
  growSurf: PT.shape(),
};

function mapStateToProps(state) {
  const { growSurf } = state;
  return {
    growSurf,
  };
}

export default connect(
  mapStateToProps,
)(GigDetails);
