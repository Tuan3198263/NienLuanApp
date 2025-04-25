// Định nghĩa các màn hình chính (không hiện nút back)
export const mainScreens = ['/', '/home', '/index', '/brands', '/account', '/articles'];

// Hàm kiểm tra xem có phải màn hình chính không
export const isMainScreen = (pathname) => {
  return mainScreens.some(screen => pathname === screen || pathname.startsWith(screen + '/'));
};

// Hàm kiểm tra xem có phải màn hình tab không 
export const isTabScreen = (pathname) => {
  // Định nghĩa các màn hình tab chính
  const tabScreens = ['/', '/home', '/brands', '/account', '/articles'];
  return tabScreens.includes(pathname);
};
