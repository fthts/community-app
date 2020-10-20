/**
 * This component receives via props a single submission data object,
 * and showScreeningDetails boolean property, which should tell whether
 * the Screening Details component should be rendered or not
 * (and also to choose the proper orientation of arrow icon).
 *
 * Also, this component will receive the following callbacks to be triggered
 * when user clicks on buttons/icons/links:
 * onDelete() (to be triggered by delete icon),
 * onDownload() (to be triggered by download icon),
 * onShowDetails() (to be triggered by details arrow icon, and also by screening status component).
 */

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { services } from 'topcoder-react-lib';
import { COMPETITION_TRACKS, CHALLENGE_STATUS } from 'utils/tc';

import PT from 'prop-types';

import DeleteIcon from '../Icons/IconTrashSimple.svg';
import DownloadIcon from '../Icons/IconSquareDownload.svg';
import ExpandIcon from '../Icons/IconMinimalDown.svg';
import ScreeningStatus from '../ScreeningStatus';

import './styles.scss';

const { getService } = services.submissions;

export default function Submission(props) {
  const {
    auth,
    submissionObject,
    showScreeningDetails,
    track,
    onDelete,
    onShowDetails,
    status,
    allowDelete,
  } = props;
  const formatDate = date => moment(+new Date(date)).format('MMM DD, YYYY hh:mm A');

  return (
    <tr styleName="submission-row">
      <td styleName="id-col">
        {submissionObject.id}
        <div styleName="legacy-id">{submissionObject.legacySubmissionId}</div>
      </td>
      <td>
        {submissionObject.type}
      </td>
      <td styleName="date-col">
        {formatDate(submissionObject.created)}
      </td>
      {
        track === COMPETITION_TRACKS.DES && (
          <td styleName="status-col">
            {submissionObject.screening
              && (
              <ScreeningStatus
                screeningObject={submissionObject.screening}
                onShowDetails={onShowDetails}
                submissionId={submissionObject.id}
              />
              )}
          </td>
        )
      }
      <td styleName="action-col">
        <div>
          <button
            onClick={() => {
              // download submission
              const submissionsService = getService(auth.tokenV3);
              submissionsService.downloadSubmission(submissionObject.id)
                .then((blob) => {
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `submission-${submissionObject.id}.zip`);
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                });
            }}
            type="button"
          >
            <DownloadIcon />
          </button>
          { /*
            TODO: At the moment we just fetch downloads from the legacy
              Topcoder Studio API, and we don't need any JS code to this.
              It may change soon, as we move to the new TC API for
              downloads. Then we'll use this commented out code or
              remove it for good.
          <button
            onClick={() => onDownload(submissionObject.id)}
          ><DownloadIcon /></button>
          */ }
          {status !== CHALLENGE_STATUS.COMPLETED
            && track !== COMPETITION_TRACKS.DES
            && (
            <button
              styleName="delete-icon"
              onClick={() => onDelete(submissionObject.id)}
              disabled={!allowDelete}
              type="button"
            >
              <DeleteIcon />
            </button>
            )
          }
          <button
            styleName={`expand-icon ${(showScreeningDetails ? 'expanded' : '')}`}
            onClick={() => onShowDetails(submissionObject.id)}
            type="button"
          >
            <ExpandIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

Submission.defaultProps = {
  submissionObject: {},
  showScreeningDetails: false,
  onShowDetails: _.noop,
};

Submission.propTypes = {
  submissionObject: PT.shape({
    id: PT.string,
    legacySubmissionId: PT.string,
    warpreviewnings: PT.string,
    screening: PT.shape({
      status: PT.string,
    }),
    submitted: PT.string,
    type: PT.string,
    created: PT.any,
    download: PT.any,
  }),
  showScreeningDetails: PT.bool,
  track: PT.string.isRequired,
  onDelete: PT.func.isRequired,
  onShowDetails: PT.func,
  status: PT.string.isRequired,
  allowDelete: PT.bool.isRequired,
  auth: PT.shape().isRequired,
};
