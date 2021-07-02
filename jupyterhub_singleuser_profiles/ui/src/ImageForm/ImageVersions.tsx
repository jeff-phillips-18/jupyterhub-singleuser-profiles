import * as React from 'react';
import classNames from 'classnames';
import compareVersions from 'compare-versions';
import { Button, ButtonVariant, Label, Radio } from '@patternfly/react-core';
import { AngleRightIcon, AngleDownIcon, StarIcon } from '@patternfly/react-icons';
import { ImageTagType, ImageType } from '../utils/types';
import ImageTagPopover from './ImageTagPopover';
import { getDescriptionForTag, getVersion, isImageTagBuildValid } from './imageUtils';

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

  const getRadioDisabledOptions = (tag: ImageTagType) => {
    const disabled = !isImageTagBuildValid(tag);
    return {
      classes: classNames('jsp-spawner__image-options__option', {
        'm-is-disabled': disabled,
      }),
      isDisabled: disabled,
    };
  };

  return (
    <div className="jsp-spawner__image-options__tags">
      <Button variant={ButtonVariant.tertiary} onClick={() => setOpen(!open)}>
        {open ? <AngleDownIcon /> : <AngleRightIcon />}
        Versions
      </Button>
      {open ? (
        <div className="jsp-spawner__image-options__tag-versions">
          {image.tags
            .sort((a, b) => compareVersions(b.name, a.name))
            .map((tag) => (
              <Radio
                key={tag.name}
                id={tag.name}
                name={tag.name}
                {...getRadioDisabledOptions(tag)}
                label={
                  <span className="jsp-spawner__image-options__title">
                    Version{` ${getVersion(tag.name)}`}
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
