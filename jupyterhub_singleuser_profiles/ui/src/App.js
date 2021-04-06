import React from 'react';
import './App.css';
import SizesForm from './SizesForm';
import ImageForm from './ImageForm';
import EnvVarForm from './EnvVarForm';
import GpuForm from './GpuForm';
import APICalls from "./CustomElements/APICalls";

function App() {
  const [user, setUser] = React.useState('');
  React.useEffect(() => {
    const API = new APICalls()
    API.APIGet(API._WHOAMIPATH).then((resp) => {
      console.dir(resp);
      setUser(resp)
    }).catch(e => console.dir(e));
  }, []);

  return (
      <div className="App">
        <header className="App-header">
          <h1 id="header-text">Spawner Options (CORS): {user}</h1>
          <div className="Grid WideForm">
            <h3 className="Wide">JupyterHub Notebook Image:</h3>
            <ImageForm/>
          </div>
          <h3 className="Wide">Deployment size:</h3>
          <div className="WideForm">
            <div className="Grid" margin-bottom="10px">
              <h3 className="Wide">Container size:</h3>
              <SizesForm/>
            </div>
            <div className="Grid">
              <h3 className="Wide">Number of required GPUs:</h3>
              <GpuForm/>
            </div>
          </div>
          <EnvVarForm/>
        </header>
      </div>
  );
}

export default App;
