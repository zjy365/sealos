import { createIcon } from '@chakra-ui/react';

const LeftArrowIcon = createIcon({
  displayName: 'LeftArrowIcon',
  viewBox: '0 0 24 24',
  path: (
    <g>
      <path
        fill="none"
        d="M19 12H5"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fill="none"
        d="M12 19L5 12L12 5"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
});
export default LeftArrowIcon;
