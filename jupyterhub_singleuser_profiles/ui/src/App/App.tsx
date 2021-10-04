import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import {
  Button,
  ButtonVariant,
  Title,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import ImageForm from '../ImageForm/ImageForm';
import SizesForm from '../SizesForm/SizesForm';
import EnvVarForm from '../EnvVarForm/EnvVarForm';
import { APIGet } from '../utils/APICalls';
import { CM_PATH, UI_CONFIG_PATH, USER } from '../utils/const';
import { UiConfigType, UserConfigMapType } from '../utils/types';
import { HubUserRequest } from '../utils/HubCalls';
import StartServerModal from './StartServerModal';

import './App.scss';

const App: React.FC = () => {
  const [uiConfig, setUiConfig] = React.useState<UiConfigType>();
  const [configError, setConfigError] = React.useState<string>();
  const [imageValid, setImageValid] = React.useState<boolean>(false);
  const [userConfig, setUserConfig] = React.useState<UserConfigMapType>();
  const [startShown, setStartShown] = React.useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageRef = React.useRef<any>();

  React.useEffect(() => {
    console.log(`Spawn URL: ${(window as any).jhdata['spawn-url']}`);
    let cancelled = false;
    HubUserRequest('GET', 'server/progress')
      .then((response) => {
        if (response?.status !== 400) {
          setStartShown(true);
        }
      })
      .catch((e) => {
        console.error(e.message);
      });

    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      if (!cancelled) {
        setUserConfig(data);
      }
    });

    APIGet(UI_CONFIG_PATH)
      .then((data: UiConfigType) => {
        if (!cancelled) {
          setUiConfig(data);
        }
      })
      .catch((e) => {
        console.error(e);
        setConfigError(e);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const renderContent = () => {
    if (configError) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel="h5" size="lg">
            Unable to load notebook server configuration options
          </Title>
          <EmptyStateBody>Please contact your system administrator</EmptyStateBody>
        </EmptyState>
      );
    }

    if (!uiConfig || !userConfig) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <Spinner isSVG size="xl" />
        </EmptyState>
      );
    }

    return (
      <>
        <ImageForm
          uiConfig={uiConfig}
          userConfig={userConfig}
          onValidImage={() => setImageValid(true)}
        />
        <SizesForm uiConfig={uiConfig} userConfig={userConfig} />
        {uiConfig.envVarConfig?.enabled !== false && (
          <EnvVarForm uiConfig={uiConfig} userConfig={userConfig} />
        )}
        <div className="jsp-spawner__buttons-bar">
          <Button
            variant={ButtonVariant.primary}
            disabled={!imageValid}
            className="jsp-spawner__submit-button"
            onClick={() => setStartShown(true)}
          >
            Start Server
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="jsp-spawner" ref={pageRef}>
      <div className="jsp-spawner__header">
        <div className="jsp-spawner__header__title">Start a notebook server</div>
        <div className="jsp-spawner__header__sub-title">
          {USER
            ? `Select options for ${USER}'s notebook server`
            : 'Select options for your notebook server.'}
        </div>
      </div>
      {renderContent()}
      {startShown ? (
        <StartServerModal
          pageRef={pageRef.current}
          shown={startShown}
          onClose={() => setStartShown(false)}
        />
      ) : null}
    </div>
  );
};

export default App;
