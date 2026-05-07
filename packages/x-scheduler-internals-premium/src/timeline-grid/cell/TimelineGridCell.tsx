'use client';
import * as React from 'react';
import { useRenderElement, BaseUIComponentProps } from '@mui/x-scheduler-internals/base-ui-copy';

export const TimelineGridCell = React.forwardRef(function TimelineGridCell(
  componentProps: TimelineGridCell.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    // Rendering props
    className,
    render,
    style,
    // Props forwarded to the DOM element
    ...elementProps
  } = componentProps;

  return useRenderElement('div', componentProps, {
    ref: [forwardedRef],
    props: [{ role: 'gridcell' }, elementProps],
  });
});

export namespace TimelineGridCell {
  export interface State {}

  export interface Props extends BaseUIComponentProps<'div', State> {}
}
