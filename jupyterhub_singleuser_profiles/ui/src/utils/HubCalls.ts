import { DEV_MODE, DEV_SERVER, HUB_PATH, MOCK_MODE, USER } from './const';
import { getMockProgress, mockData } from '../__mock__/mockData';

export const getHubPath = (request: string): string => {
  const hubPath = `${HUB_PATH}/${request}`;
  if (DEV_MODE) {
    return DEV_SERVER + hubPath;
  }
  return hubPath;
};

export const getUserHubPath = (request: string): string => getHubPath(`users/${USER}/${request}`);

export const HubUserRequest = (
  method: 'GET' | 'POST' | 'DELETE',
  target: string,
  json?: string,
): Promise<Response | null> => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const requestPath = getUserHubPath(target);
  if (MOCK_MODE) {
    if (method === 'POST') {
      return Promise.resolve({ status: 202 } as Response);
    }
    if (method === 'DELETE') {
      return Promise.resolve({ status: 204 } as Response);
    }
    return Promise.resolve(mockData[target]);
  }
  return new Promise((resolve, reject) => {
    fetch(requestPath, { method, body: json, headers: headers })
      .then((response) => {
        if (response.ok) {
          resolve(response);
        } else {
          reject('Failed to send ' + requestPath);
        }
      })
      .catch((err) => {
        console.error(`Unable to send ${requestPath}`);
        console.dir(err);
        reject(err.message);
      });
  });
};

export const HubGetSpawnProgress = (): EventSource => {
  const requestPath = getUserHubPath('server/progress');
  if (DEV_MODE) {
    return getMockProgress();
  }
  return new EventSource(requestPath);
};
