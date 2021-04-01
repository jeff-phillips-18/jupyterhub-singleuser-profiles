import * as React from 'react';
import { OutlinedQuestionCircleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH, IMAGE_PATH } from '../utils/const';
import { Button, ButtonVariant, Popover, Radio } from '@patternfly/react-core';

import './ImageForm.scss';

const ImageForm: React.FC = () => {
  const [imageDropdownOpen, setImageDropdownOpen] = React.useState<boolean>(false);
  const [selectedValue, setSelectedValue] = React.useState<string>();
  const [imageList, setImageList] = React.useState<string[]>([]);

  const postChange = (text) => {
    if (typeof text !== "string") {
      text = text.target.text;
    }
    const json = JSON.stringify({last_selected_image: text});
    APIPost(CM_PATH, json);
  };

  React.useEffect(() => {
    let cancelled = false;
    APIGet(CM_PATH).then((data: any) => {
      console.dir(data);
      if (!cancelled) {
        setSelectedValue(data['last_selected_image']);
      }
    });
    APIGet(IMAGE_PATH).then((data: any) => {
      if (!cancelled) {
        setImageList(data);
      }
    });
    return () => {
      cancelled = true;
    }
  }, []);

  React.useEffect(() => {
    if (imageList.includes(selectedValue)) {
      return;
    }
    if (imageList.length > 0) {
      setSelectedValue(imageList[0]);
      postChange(imageList[0])
    }
  }, [selectedValue, imageList]);

  const handleSelection = (image: string, checked: boolean) => {
    if (checked) {
      setSelectedValue(image);
      postChange(image);
    }
  };

  const selectOptions = imageList.map((image) => (
    <Radio
      key={image}
      id={image}
      name={image}
      className="jsp-spawner__image-options__option"
      label={(
        <span className="jsp-spawner__image-options__title">
          {image}
          <Popover
            className="jsp-spawner__image-options__packages-popover"
            showClose
            bodyContent={(
              <>
                <span className="jsp-spawner__image-options__packages-popover__title">
                  Packages included:
                </span>
                <span className="jsp-spawner__image-options__packages-popover__package">
                  Boto3 v1.16.59
                </span>
                <span className="jsp-spawner__image-options__packages-popover__package">
                  Kafka-Python v2.0.2
                </span>
                <span className="jsp-spawner__image-options__packages-popover__package">
                  Pandas v1.2.1
                </span>
                <span className="jsp-spawner__image-options__packages-popover__package">
                  Matplotlib v3.3.3
                </span>
                <Button variant={ButtonVariant.link}>
                  <span className="jsp-spawner__image-options__packages-popover__link-text">
                    Learn more about preinstalled packages
                  </span>
                  <ExternalLinkAltIcon className="jsp-spawner__image-options__packages-popover__link-icon" />
                </Button>
              </>
            )}
          >
            <OutlinedQuestionCircleIcon />
          </Popover>
        </span>
      )}
      description={image}
      isChecked={image === selectedValue}
      onChange={(checked: boolean) => handleSelection(image, checked)} />
  ));

  return (
    <div className="jsp-spawner__option-section">
      <div className="jsp-spawner__option-section__title">
        JupyterHub Notebook image
        <OutlinedQuestionCircleIcon />
      </div>
      <div className="jsp-spawner__image-options">
        {selectOptions}
      </div>
    </div>
  )
};

export default ImageForm;