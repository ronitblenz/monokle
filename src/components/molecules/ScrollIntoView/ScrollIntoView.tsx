import React from 'react';

interface ScrollIntoViewProps {
  children: React.ReactNode;
}

const ScrollIntoView = React.forwardRef(({children}: ScrollIntoViewProps, ref) => {
  const containerRef = React.useRef<any>(null);
  React.useImperativeHandle(ref, () => {
    return {
      scrollIntoView: () => {
        containerRef.current?.scrollIntoView();
      },
    };
  });

  return <span ref={containerRef}>{children}</span>;
});

export default ScrollIntoView;