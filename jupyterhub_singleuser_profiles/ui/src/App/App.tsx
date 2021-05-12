import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import './App.scss';
import ImageForm from '../ImageForm/ImageForm';
import SizesForm from '../SizesForm/SizesForm';
import EnvVarForm from '../EnvVarForm/EnvVarForm';
import { APIGet, getSubmitURL } from '../utils/APICalls';
import { MOCK_MODE, UI_CONFIG_PATH } from '../utils/const';
import { UiConfigType } from '../utils/types';

const App: React.FC = () => {
  const [uiConfig, setUiConfig] = React.useState<UiConfigType>();
  React.useEffect(() => {
    let cancelled = false;

    APIGet(UI_CONFIG_PATH)
      .then((data: UiConfigType) => {
        if (!cancelled) {
          setUiConfig(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!uiConfig) {
    return null;
  }

  const handleSubmit = (): boolean => {
    console.log(`------ Submit -----`);
    return true;
  };

  const handleClick = () => {
    console.log(`------ Click -----`);
  };

  const spawnerUI = (
    <div className="jsp-spawner">
      <div className="jsp-spawner__header">
        <div className="jsp-spawner__header__title">Start a notebook server</div>
        <div className="jsp-spawner__header__sub-title">
          Select options for your notebook server.
        </div>
      </div>
      <ImageForm uiConfig={uiConfig} />
      <SizesForm uiConfig={uiConfig} />
      {uiConfig.envVarConfig?.enabled !== false && <EnvVarForm uiConfig={uiConfig} />}
      <div className="jsp-spawner__buttons-bar">
        <input
          type="submit"
          value="Start server"
          className="jsp-spawner__submit-button pf-c-button pf-m-primary"
          onClick={() => handleClick()}
          onSubmit={() => handleSubmit()}
        />
      </div>
    </div>
  );
  return (
    <form
      encType="multipart/form-data"
      id="spawn_form"
      action={getSubmitURL()}
      method="post"
      role="form"
    >
      {spawnerUI}
    </form>
  );
  return spawnerUI;
};

export default App;
