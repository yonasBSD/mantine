import { useEffect, useState } from 'react';
import {
  Box,
  BoxProps,
  createVarsResolver,
  getRadius,
  MantineRadius,
  polymorphicFactory,
  PolymorphicFactory,
  StylesApiProps,
  useProps,
  useStyles,
} from '../../core';
import classes from './Image.module.css';

export type ImageStylesNames = 'root';
export type ImageCssVariables = {
  root: '--image-radius' | '--image-object-fit';
};

export interface ImageProps extends BoxProps, StylesApiProps<ImageFactory> {
  /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `0` */
  radius?: MantineRadius;

  /** Controls `object-fit` style @default `'cover'` */
  fit?: React.CSSProperties['objectFit'];

  /** Image url used as a fallback if the image cannot be loaded */
  fallbackSrc?: string;

  /** Image url */
  src?: any;

  /** Called when image fails to load */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export type ImageFactory = PolymorphicFactory<{
  props: ImageProps;
  defaultRef: HTMLImageElement;
  defaultComponent: 'img';
  stylesNames: ImageStylesNames;
  vars: ImageCssVariables;
}>;

const varsResolver = createVarsResolver<ImageFactory>((_, { radius, fit }) => ({
  root: {
    '--image-radius': radius === undefined ? undefined : getRadius(radius),
    '--image-object-fit': fit,
  },
}));

export const Image = polymorphicFactory<ImageFactory>((_props, ref) => {
  const props = useProps('Image', null, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    onError,
    src,
    radius,
    fit,
    fallbackSrc,
    mod,
    attributes,
    ...others
  } = props;

  const [error, setError] = useState(!src);

  useEffect(() => setError(!src), [src]);

  const getStyles = useStyles<ImageFactory>({
    name: 'Image',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    attributes,
    vars,
    varsResolver,
  });

  if (error && fallbackSrc) {
    return (
      <Box
        component="img"
        ref={ref}
        src={fallbackSrc}
        {...getStyles('root')}
        onError={onError}
        mod={['fallback', mod]}
        {...others}
      />
    );
  }

  return (
    <Box
      component="img"
      ref={ref}
      {...getStyles('root')}
      src={src}
      onError={(event) => {
        onError?.(event);
        setError(true);
      }}
      mod={mod}
      {...others}
    />
  );
});

Image.classes = classes;
Image.displayName = '@mantine/core/Image';
