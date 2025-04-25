/**
 * Hàm throttle để giới hạn tần suất gọi một function
 * @param func Hàm cần throttle
 * @param limit Thời gian giới hạn (ms)
 * @returns Hàm đã được throttle
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...funcArgs: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T>;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

