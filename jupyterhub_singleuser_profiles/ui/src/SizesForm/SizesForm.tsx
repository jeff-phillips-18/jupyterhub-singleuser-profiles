import * as React from 'react';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import './SizesForm.scss';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH, IMAGE_PATH, SIZES_PATH } from '../utils/const';

const SizesForm: React.FC = () => {
  const [sizeDropdownOpen, setSizeDropdownOpen] = React.useState<boolean>(false);
  const [gpuDropdownOpen, setGpuDropdownOpen] = React.useState<boolean>(false);
  const [userCM, setUserCM] = React.useState();
  const [sizeList, setSizeList] = React.useState();
  const [selectedSize, setSelectedSize] = React.useState<string>('Default');
  const [selectedGpu, setSelectedGpu] = React.useState<number>(0);

  const postSizeChange = (text: string): Promise<any> => {
    const json = JSON.stringify({ last_selected_size: text });
    return APIPost(CM_PATH, json);
  };


  React.useEffect(() => {
    let cancelled = false;
    APIGet(CM_PATH).then((data: any) => {
      if (!cancelled) {
        setUserCM(data);
      }
    });
    APIGet(SIZES_PATH).then((data: any) => {
      if (!cancelled) {
        setSizeList(data);
      }
    });
    return () => {
      cancelled = true;
    }
  }, []);

  React.useEffect(() => {
    if (userCM) {
      if (userCM['last_selected_size'] !== selectedSize) {
        setSelectedSize(userCM['last_selected_size']);
      }
      if (userCM['gpu'] !== selectedGpu) {
        setSelectedGpu(userCM['gpu']);
      }
    }
  }, [userCM]);

  React.useEffect(() => {
    let cancelled = false;
    if (!sizeList) {
      return;
    }

    for (let i = 0; i < sizeList.length; i++) {
      if (sizeList[i] === selectedSize || selectedSize === 'Default') {
        return
      }
    }
    setSelectedSize('Default');
    postSizeChange('Default').then(() => {
      APIGet(CM_PATH).then((data: any) => {
        if (!cancelled) {
          setUserCM(data);
        }
      });
    });

    return () => {
      cancelled = true;
    }
  }, [selectedSize, sizeList]);

  return (
    <div className="jsp-spawner__option-section">
      <div className="jsp-spawner__option-section__title">
        Deployment size
      </div>
      <div className="jsp-spawner__size_options__title">
        Container size
        <OutlinedQuestionCircleIcon />
      </div>
      <div className="jsp-spawner__size_options__title">
        Number of GPUs
        <OutlinedQuestionCircleIcon />
      </div>
    </div>
  );
};

export default SizesForm;