import * as React from 'react';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

type EnvVarFormProps = {
  userCM: any;
};

const EnvVarForm: React.FC = ({ userCM }) => {

  return (
    <div className="jsp-spawner__option-section">
      <div className="jsp-spawner__option-section__title">
        Environment variables
        <OutlinedQuestionCircleIcon />
      </div>
    </div>
  );
};

export default EnvVarForm;