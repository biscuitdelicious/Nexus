import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;
  const columns = isPhone ? 1 : isTablet ? 2 : 3;
  const padding = isPhone ? 12 : isTablet ? 16 : 24;
  const gap = isPhone ? 8 : 12;

  return { width, height, isPhone, isTablet, isDesktop, columns, padding, gap };
}
