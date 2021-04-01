import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import './App.scss';
import { Button, ButtonVariant, Text, TextContent, TextVariants } from '@patternfly/react-core';
import ImageForm from '../ImageForm/ImageForm';
import SizesForm from '../SizesForm/SizesForm';
import EnvVarForm from '../EnvVarForm/EnvVarForm';
import { APIGet } from '../utils/APICalls';
import { CM_PATH, SIZES_PATH } from '../utils/const';

const App: React.FC = () => {
  const [userCM, setUserCM] = React.useState();

  const onStartServer = () => {
    console.log(`======== Start Server ===========`);
  };
  const onCancel = () => {
    console.log(`======== Start Server ===========`);
  };

  // React.useEffect(() => {
  //   let cancelled = false;
  //   setTimeout(() => {
  //     APIGet(CM_PATH).then((data: any) => {
  //       if (!cancelled) {
  //         setUserCM(data);
  //       }
  //     });
  //   }, 200);
  //   return () => {
  //     cancelled = true;
  //   }
  // }, []);
  //
  // if (!userCM) {
  //   return null;
  // }
  return (
      <div className="jsp-spawner">
        <div className="jsp-spawner__header">
          <div className="jsp-spawner__header__title">Start a Notebook server</div>
          <div className="jsp-spawner__header__sub-title">Select options for your Notebook server.</div>
        </div>
        <ImageForm userCM={userCM} />
        <SizesForm userCM={userCM} />
        <EnvVarForm userCM={userCM} />
        <div className="jsp-spawner__buttons-bar">
          <Button variant={ButtonVariant.primary} onClick={onStartServer}>Start server</Button>
          <Button variant={ButtonVariant.secondary} onClick={onCancel}>Cancel</Button>
        </div>
      </div>
  );
};

export default App;
