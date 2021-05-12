import * as React from 'react';
import { Button, ButtonVariant, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { CUSTOM_VARIABLE, EMPTY_KEY, VariableRow } from './types';
import { EnvVarCategoryType, EnvVarType } from '../utils/types';
import EnvVariablesVariable from './EnvVariablesVariable';

type EnvVariablesRowProps = {
  variableRow: VariableRow;
  categories: EnvVarCategoryType[];
  onUpdate: (updatedRow?: VariableRow) => void;
  onSave: () => void;
};

const EnvVariablesRow: React.FC<EnvVariablesRowProps> = ({
  variableRow,
  categories,
  onUpdate,
  onSave,
}) => {
  const [typeDropdownOpen, setTypeDropdownOpen] = React.useState<boolean>(false);
  const categoryOptions = categories.map((category) => (
    <SelectOption value={category.name} key={category.name} />
  ));
  const selectOptions = [
    <SelectOption value={CUSTOM_VARIABLE} key={CUSTOM_VARIABLE} />,
    ...categoryOptions,
  ];

  const removeVariables = () => {
    onUpdate();
    onSave();
  };

  const updateVariable = (updatedVariable: EnvVarType, originalName: string) => {
    const updatedRow: VariableRow = {
      variableType: variableRow.variableType,
      variables: [...variableRow.variables],
      errors: { ...variableRow.errors },
    };
    const index = variableRow.variables.findIndex((v) => v.name === originalName);
    if (index >= 0) {
      updatedRow.variables[index] = updatedVariable;
      onUpdate(updatedRow);
    }
  };

  const updateVariableType = (newType: string) => {
    console.log(`Updating variable type: ${variableRow.variableType} -> ${newType}`);
    if (variableRow.variableType === newType) {
      setTypeDropdownOpen(false);
      return;
    }
    const newCategory = categories.find((category) => category.name === newType);
    const variables = newCategory?.variables.map((variable) => {
      return {
        name: variable.name,
        type: variable.type,
        value: '',
      };
    }) ?? [
      {
        name: EMPTY_KEY,
        type: 'text',
        value: '',
      },
    ];

    const updatedRow: VariableRow = {
      variableType: newType,
      variables: variables,
      errors: {},
    };

    onUpdate(updatedRow);
    onSave();
    setTypeDropdownOpen(false);
  };

  return (
    <div className="jsp-spawner__env-var-form__var-row">
      <Select
        className="jsp-spawner__size_options__select"
        variant={SelectVariant.single}
        isOpen={typeDropdownOpen}
        onToggle={() => setTypeDropdownOpen(!typeDropdownOpen)}
        aria-labelledby="container-size"
        selections={variableRow.variableType}
        onSelect={(e, selection) => updateVariableType(selection as string)}
      >
        {selectOptions}
      </Select>
      <Button
        className="jsp-spawner__env-var-form__var-row__remove"
        variant={ButtonVariant.link}
        onClick={removeVariables}
      >
        <MinusCircleIcon />
      </Button>
      {variableRow.variables.map((variable, index) => (
        <EnvVariablesVariable
          key={index}
          variable={variable}
          variableRow={variableRow}
          onUpdateVariable={(updatedVariable) => updateVariable(updatedVariable, variable.name)}
          onSave={onSave}
        />
      ))}
    </div>
  );
};

export default EnvVariablesRow;
