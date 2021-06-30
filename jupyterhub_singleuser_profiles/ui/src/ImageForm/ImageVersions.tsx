import * as React from 'react';
import { Button, ButtonVariant, Label, Radio } from '@patternfly/react-core';
import { AngleRightIcon, AngleDownIcon, StarIcon } from '@patternfly/react-icons';
import { ImageType } from '../utils/types';
import ImageTagPopover from './ImageTagPopover';
import { getDescriptionForTag } from './imageUtils';

type ImageVersionsProps = {
  image: ImageType;
  selectedTag?: string;
  onSelect: (tagName: string, selected: boolean) => void;
};

const ImageVersions: React.FC<ImageVersionsProps> = ({ image, selectedTag, onSelect }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  if (image.tags.length < 2) {
    return null;
  }

  const getVersion = (version: string): string => {
    if (version.startsWith('v') || version.startsWith('V')) {
      return version.slice(1);
    }
    return version;
  };

  return (
    <div className="jsp-spawner__image-options__tags">
      <Button variant={ButtonVariant.tertiary} onClick={() => setOpen(!open)}>
        {open ? <AngleDownIcon /> : <AngleRightIcon />}
        Versions
      </Button>
      {open ? (
        <div className="jsp-spawner__image-options__tag-versions">
          {image.tags.map((tag) => (
            <Radio
              key={tag.name}
              id={tag.name}
              name={tag.name}
              className="jsp-spawner__image-options__option"
              label={
                <span className="jsp-spawner__image-options__title">
                  <span className="jsp-spawner__image-options__title-version">
                    Version{` ${getVersion(tag.name)}`}
                  </span>
                  <ImageTagPopover tag={tag} />
                  {tag.recommended ? (
                    <Label color="blue" icon={<StarIcon />}>
                      Recommended
                    </Label>
                  ) : null}
                </span>
              }
              description={getDescriptionForTag(tag)}
              isChecked={tag.name === selectedTag}
              onChange={(checked: boolean) => onSelect(tag.name, checked)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ImageVersions;
