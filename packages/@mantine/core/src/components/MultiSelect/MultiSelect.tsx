import { useEffect } from 'react';
import { useId, useUncontrolled } from '@mantine/hooks';
import {
  BoxProps,
  ElementProps,
  extractStyleProps,
  factory,
  Factory,
  MantineColor,
  StylesApiProps,
  useProps,
  useResolvedStylesApi,
  useStyles,
} from '../../core';
import {
  Combobox,
  ComboboxItem,
  ComboboxLikeProps,
  ComboboxLikeRenderOptionInput,
  ComboboxLikeStylesNames,
  getOptionsLockup,
  getParsedComboboxData,
  OptionsDropdown,
  useCombobox,
} from '../Combobox';
import { __BaseInputProps, __InputStylesNames, InputClearButtonProps } from '../Input';
import { InputBase } from '../InputBase';
import { Pill } from '../Pill';
import { PillsInput } from '../PillsInput';
import { ScrollAreaProps } from '../ScrollArea';
import { filterPickedValues } from './filter-picked-values';

export type MultiSelectStylesNames =
  | __InputStylesNames
  | ComboboxLikeStylesNames
  | 'pill'
  | 'pillsList'
  | 'inputField';

export interface MultiSelectProps
  extends BoxProps,
    __BaseInputProps,
    ComboboxLikeProps,
    StylesApiProps<MultiSelectFactory>,
    ElementProps<'input', 'size' | 'value' | 'defaultValue' | 'onChange'> {
  /** Controlled component value */
  value?: string[];

  /** Uncontrolled component default value */
  defaultValue?: string[];

  /** Called when value changes */
  onChange?: (value: string[]) => void;

  /** Called with `value` of the removed item */
  onRemove?: (value: string) => void;

  /** Called when the clear button is clicked */
  onClear?: () => void;

  /** Controlled search value */
  searchValue?: string;

  /** Default search value */
  defaultSearchValue?: string;

  /** Called when search changes */
  onSearchChange?: (value: string) => void;

  /** Maximum number of values, no limit if not set */
  maxValues?: number;

  /** Allows searching @default `false` */
  searchable?: boolean;

  /** Message displayed when no option matches the current search query while the `searchable` prop is set or there is no data */
  nothingFoundMessage?: React.ReactNode;

  /** If set, the check icon is displayed near the selected option label @default `true` */
  withCheckIcon?: boolean;

  /** Position of the check icon relative to the option label @default `'left'` */
  checkIconPosition?: 'left' | 'right';

  /** If set, picked options are removed from the options list @default `false` */
  hidePickedOptions?: boolean;

  /** If set, the clear button is displayed in the right section when the component has value @default `false` */
  clearable?: boolean;

  /** Props passed down to the clear button */
  clearButtonProps?: InputClearButtonProps;

  /** Props passed down to the hidden input */
  hiddenInputProps?: Omit<React.ComponentPropsWithoutRef<'input'>, 'value'>;

  /** Divider used to separate values in the hidden input `value` attribute @default `','` */
  hiddenInputValuesDivider?: string;

  /** A function to render content of the option, replaces the default content of the option */
  renderOption?: (item: ComboboxLikeRenderOptionInput<ComboboxItem>) => React.ReactNode;

  /** Props passed down to the underlying `ScrollArea` component in the dropdown */
  scrollAreaProps?: ScrollAreaProps;

  /** Controls color of the default chevron */
  chevronColor?: MantineColor;

  /** Clear search value when item is selected */
  clearSearchOnChange?: boolean;
}

export type MultiSelectFactory = Factory<{
  props: MultiSelectProps;
  ref: HTMLInputElement;
  stylesNames: MultiSelectStylesNames;
}>;

const defaultProps = {
  maxValues: Infinity,
  withCheckIcon: true,
  checkIconPosition: 'left',
  hiddenInputValuesDivider: ',',
  clearSearchOnChange: true,
} satisfies Partial<MultiSelectProps>;

export const MultiSelect = factory<MultiSelectFactory>((_props, ref) => {
  const props = useProps('MultiSelect', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    size,
    value,
    defaultValue,
    onChange,
    onKeyDown,
    variant,
    data,
    dropdownOpened,
    defaultDropdownOpened,
    onDropdownOpen,
    onDropdownClose,
    selectFirstOptionOnChange,
    onOptionSubmit,
    comboboxProps,
    filter,
    limit,
    withScrollArea,
    maxDropdownHeight,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    readOnly,
    disabled,
    onFocus,
    onBlur,
    radius,
    rightSection,
    rightSectionWidth,
    rightSectionPointerEvents,
    rightSectionProps,
    leftSection,
    leftSectionWidth,
    leftSectionPointerEvents,
    leftSectionProps,
    inputContainer,
    inputWrapperOrder,
    withAsterisk,
    labelProps,
    descriptionProps,
    errorProps,
    wrapperProps,
    description,
    label,
    error,
    maxValues,
    searchable,
    nothingFoundMessage,
    withCheckIcon,
    checkIconPosition,
    hidePickedOptions,
    withErrorStyles,
    name,
    form,
    id,
    clearable,
    clearButtonProps,
    hiddenInputProps,
    placeholder,
    hiddenInputValuesDivider,
    required,
    mod,
    renderOption,
    onRemove,
    onClear,
    scrollAreaProps,
    chevronColor,
    attributes,
    clearSearchOnChange,
    ...others
  } = props;

  const _id = useId(id);
  const parsedData = getParsedComboboxData(data);
  const optionsLockup = getOptionsLockup(parsedData);

  const combobox = useCombobox({
    opened: dropdownOpened,
    defaultOpened: defaultDropdownOpened,
    onDropdownOpen,
    onDropdownClose: () => {
      onDropdownClose?.();
      combobox.resetSelectedOption();
    },
  });

  const {
    styleProps,
    rest: { type, autoComplete, ...rest },
  } = extractStyleProps(others);

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: [],
    onChange,
  });

  const [_searchValue, setSearchValue] = useUncontrolled({
    value: searchValue,
    defaultValue: defaultSearchValue,
    finalValue: '',
    onChange: onSearchChange,
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    combobox.resetSelectedOption();
  };

  const getStyles = useStyles<MultiSelectFactory>({
    name: 'MultiSelect',
    classes: {} as any,
    props,
    classNames,
    styles,
    unstyled,
    attributes,
  });

  const { resolvedClassNames, resolvedStyles } = useResolvedStylesApi<MultiSelectFactory>({
    props,
    styles,
    classNames,
  });

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (event.key === ' ' && !searchable) {
      event.preventDefault();
      combobox.toggleDropdown();
    }

    if (event.key === 'Backspace' && _searchValue.length === 0 && _value.length > 0) {
      onRemove?.(_value[_value.length - 1]);
      setValue(_value.slice(0, _value.length - 1));
    }
  };

  const values = _value.map((item, index) => (
    <Pill
      key={`${item}-${index}`}
      withRemoveButton={!readOnly && !optionsLockup[item]?.disabled}
      onRemove={() => {
        setValue(_value.filter((i) => item !== i));
        onRemove?.(item);
      }}
      unstyled={unstyled}
      disabled={disabled}
      {...getStyles('pill')}
    >
      {optionsLockup[item]?.label || item}
    </Pill>
  ));

  useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
  }, [selectFirstOptionOnChange, _searchValue]);

  const clearButton = (
    <Combobox.ClearButton
      {...clearButtonProps}
      onClear={() => {
        onClear?.();
        setValue([]);
        handleSearchChange('');
      }}
    />
  );

  const filteredData = filterPickedValues({ data: parsedData, value: _value });
  const _clearable = clearable && _value.length > 0 && !disabled && !readOnly;

  return (
    <>
      <Combobox
        store={combobox}
        classNames={resolvedClassNames}
        styles={resolvedStyles}
        unstyled={unstyled}
        size={size}
        readOnly={readOnly}
        __staticSelector="MultiSelect"
        attributes={attributes}
        onOptionSubmit={(val) => {
          onOptionSubmit?.(val);
          if (clearSearchOnChange) {
            handleSearchChange('');
          }
          combobox.updateSelectedOptionIndex('selected');

          if (_value.includes(optionsLockup[val].value)) {
            setValue(_value.filter((v) => v !== optionsLockup[val].value));
            onRemove?.(optionsLockup[val].value);
          } else if (_value.length < maxValues) {
            setValue([..._value, optionsLockup[val].value]);
          }
        }}
        {...comboboxProps}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            {...styleProps}
            __staticSelector="MultiSelect"
            classNames={resolvedClassNames}
            styles={resolvedStyles}
            unstyled={unstyled}
            size={size}
            className={className}
            style={style}
            variant={variant}
            disabled={disabled}
            radius={radius}
            __defaultRightSection={
              <Combobox.Chevron
                size={size}
                error={error}
                unstyled={unstyled}
                color={chevronColor}
              />
            }
            __clearSection={clearButton}
            __clearable={_clearable}
            rightSection={rightSection}
            rightSectionPointerEvents={rightSectionPointerEvents || (clearButton ? 'all' : 'none')}
            rightSectionWidth={rightSectionWidth}
            rightSectionProps={rightSectionProps}
            leftSection={leftSection}
            leftSectionWidth={leftSectionWidth}
            leftSectionPointerEvents={leftSectionPointerEvents}
            leftSectionProps={leftSectionProps}
            inputContainer={inputContainer}
            inputWrapperOrder={inputWrapperOrder}
            withAsterisk={withAsterisk}
            labelProps={labelProps}
            descriptionProps={descriptionProps}
            errorProps={errorProps}
            wrapperProps={wrapperProps}
            description={description}
            label={label}
            error={error}
            withErrorStyles={withErrorStyles}
            __stylesApiProps={{
              ...props,
              rightSectionPointerEvents: rightSectionPointerEvents || (_clearable ? 'all' : 'none'),
              multiline: true,
            }}
            pointer={!searchable}
            onClick={() => (searchable ? combobox.openDropdown() : combobox.toggleDropdown())}
            data-expanded={combobox.dropdownOpened || undefined}
            id={_id}
            required={required}
            mod={mod}
            attributes={attributes}
          >
            <Pill.Group
              attributes={attributes}
              disabled={disabled}
              unstyled={unstyled}
              {...getStyles('pillsList')}
            >
              {values}
              <Combobox.EventsTarget autoComplete={autoComplete}>
                <PillsInput.Field
                  {...rest}
                  ref={ref}
                  id={_id}
                  placeholder={placeholder}
                  type={!searchable && !placeholder ? 'hidden' : 'visible'}
                  {...getStyles('inputField')}
                  unstyled={unstyled}
                  onFocus={(event) => {
                    onFocus?.(event);
                    searchable && combobox.openDropdown();
                  }}
                  onBlur={(event) => {
                    onBlur?.(event);
                    combobox.closeDropdown();
                    handleSearchChange('');
                  }}
                  onKeyDown={handleInputKeydown}
                  value={_searchValue}
                  onChange={(event) => {
                    handleSearchChange(event.currentTarget.value);
                    searchable && combobox.openDropdown();
                    selectFirstOptionOnChange && combobox.selectFirstOption();
                  }}
                  disabled={disabled}
                  readOnly={readOnly || !searchable}
                  pointer={!searchable}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <OptionsDropdown
          data={hidePickedOptions ? filteredData : parsedData}
          hidden={readOnly || disabled}
          filter={filter}
          search={_searchValue}
          limit={limit}
          hiddenWhenEmpty={!nothingFoundMessage}
          withScrollArea={withScrollArea}
          maxDropdownHeight={maxDropdownHeight}
          filterOptions={searchable}
          value={_value}
          checkIconPosition={checkIconPosition}
          withCheckIcon={withCheckIcon}
          nothingFoundMessage={nothingFoundMessage}
          unstyled={unstyled}
          labelId={label ? `${_id}-label` : undefined}
          aria-label={label ? undefined : others['aria-label']}
          renderOption={renderOption}
          scrollAreaProps={scrollAreaProps}
        />
      </Combobox>
      <Combobox.HiddenInput
        name={name}
        valuesDivider={hiddenInputValuesDivider}
        value={_value}
        form={form}
        disabled={disabled}
        {...hiddenInputProps}
      />
    </>
  );
});

MultiSelect.classes = { ...InputBase.classes, ...Combobox.classes };
MultiSelect.displayName = '@mantine/core/MultiSelect';
