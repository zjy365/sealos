'use client';

import { Box, Center } from '@chakra-ui/react';
import classNames from 'classnames';
import { pick } from 'lodash';
import { Check, ChevronDown, X } from 'lucide-react';
import RCSelect, { SelectProps as RCSelectProps } from 'rc-select';
import 'rc-select/assets/index.css';
import type { DefaultOptionType } from 'rc-select/lib/Select';
import { ComponentProps, CSSProperties, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { inputOutlineTheme } from '@sealos/ui/src/theme/components/Input';
import styles from './index.module.css';

const inputSizes = {
  md: {
    field: {
      height: '40px',
      px: '14px'
    }
  },
  sm: {
    field: {
      height: '32px',
      px: '10px'
    }
  }
};
export interface SelectProps extends Omit<RCSelectProps, 'open'> {
  width?: string;
  height?: string;
  placeholder?: string;
  size?: 'md' | 'sm';
  variants?: 'outline' | 'normal' | 'outline-white';
  isInvalid?: boolean;
  onChange?: (value: any, option: any) => void;
  emptyContent?: ReactNode;
  compact?: 'left' | 'right';
  isReviewing?: boolean;
  selectable?: boolean | ((options: DefaultOptionType[] | undefined) => boolean);
}
const themeStyles = {
  variants: {
    outline: {
      ...pick(inputOutlineTheme.field, [
        'border',
        'borderColor',
        'fontSize',
        'background',
        'outline',
        'borderRadius'
      ]),
      borderRadius: '8px',
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
      '--rcc-select-focus-bg': inputOutlineTheme.field._focusVisible.bg,
      '--rcc-select-focus-color': inputOutlineTheme.field._focusVisible.color,
      '--rcc-select-focus-box-shadow': inputOutlineTheme.field._focusVisible.boxShadow,
      '--rcc-select-focus-border-color': inputOutlineTheme.field._focusVisible.borderColor,
      '--rcc-select-invalid-bg': inputOutlineTheme.field._invalid.bg,
      '--rcc-select-invalid-box-shadow': inputOutlineTheme.field._invalid.boxShadow,
      '--rcc-select-invalid-border-color': inputOutlineTheme.field._invalid.borderColor,
      '--rcc-select-placeholder-color': inputOutlineTheme.field._placeholder.color
    }
  } as Record<string, CSSProperties>
};
themeStyles.variants['outline-white'] = {
  ...themeStyles.variants['outline'],
  background: '#fff'
};
const Select = ({
  value,
  width = '100%',
  height: propHeight,
  options,
  size = 'md',
  isInvalid,
  // buttonProps,
  emptyContent,
  variants = 'outline',
  selectable: propSelectable = true,
  compact,
  style: propStyle,
  isReviewing,
  allowClear,
  ...rest
}: SelectProps) => {
  const { t } = useTranslation();
  const variantStyle = themeStyles.variants[variants];
  const inputSize = inputSizes[size] || inputSizes.md;
  const selectable =
    typeof propSelectable === 'function' ? propSelectable(options) : propSelectable;
  const [open, setOpen] = useState(false);
  const handleVisibleChange = (nextOpen: boolean) => {
    if (!selectable) {
      return;
    }
    setOpen(nextOpen);
  };
  const height = (() => {
    if (propHeight != null) return propHeight;
    if (compact) return `calc(${inputSize.field.height} - 2px)`;
    return inputSize.field.height;
  })();
  const style: CSSProperties = {
    ...variantStyle,
    width,
    [rest.mode === 'multiple' ? 'minHeight' : 'height']: height,
    ...propStyle
  };
  const dropdownStyle: CSSProperties = {
    borderRadius: variantStyle.borderRadius,
    background: '#fff',
    border: 'none',
    borderRight: '1px solid rgb(244, 244, 245)',
    boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.08);',
    fontSize: variantStyle.fontSize || '12px',
    zIndex: 1501
  };
  let dropdownClassName = `${styles.bump} ${styles.dropdown}`;
  let mobileProps: ComponentProps<typeof RCSelect> | undefined;
  let drawer: ReactNode;
  const className = classNames(
    styles.bump,
    styles.container,
    open && styles.open,
    styles[`variants-${variants}`],
    isInvalid && styles.invalid,
    compact && styles[`compact-${compact}`]
  );
  const notFoundContent = (
    <Box pt="8px" fontSize="12px">
      {emptyContent || <Center py="6px">{t('selectEmptyOptions')}</Center>}
    </Box>
  );
  const removeIcon = (
    <Center h="100%" ml="2px" cursor="pointer">
      <X size="12px" stroke={open ? 'rgb(96, 165, 250)' : 'rgba(0,0,0,0.45)'} strokeWidth={1.33} />
    </Center>
  );
  const allowClearProp = allowClear
    ? {
        clearIcon: (
          <Center bg="grayModern.250" w="16px" h="16px" borderRadius="50%">
            <X size="10px" stroke="#fff" strokeWidth={1.33} />
          </Center>
        )
      }
    : false;
  return (
    <>
      {drawer}
      <RCSelect
        // bump这个类型只是为了提高选择器权重加的。build之后css的顺序和dev有所不同，需要加一下权重
        className={className}
        value={value}
        style={style}
        animation="slide-up"
        open={!selectable ? false : open}
        options={options}
        suffixIcon={
          selectable ? (
            <ChevronDown width={16} height={16} stroke="rgb(113, 113, 122)" strokeWidth={1.33} />
          ) : null
        }
        onDropdownVisibleChange={handleVisibleChange}
        notFoundContent={notFoundContent}
        dropdownStyle={dropdownStyle}
        optionFilterProp="label"
        dropdownClassName={dropdownClassName}
        removeIcon={removeIcon}
        allowClear={allowClearProp}
        virtual
        defaultActiveFirstOption={false}
        menuItemSelectedIcon={<Check size="16px" stroke="rgb(28, 78, 245)" strokeWidth={2} />}
        {...rest}
        {...mobileProps}
      />
    </>
  );
};

export default Select;
