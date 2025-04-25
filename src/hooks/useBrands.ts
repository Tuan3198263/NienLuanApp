import { useQuery } from '@tanstack/react-query';
import { brandApi } from '../api/brandApi';

export function useBrandsByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['brands', 'category', categorySlug],
    queryFn: () => brandApi.getBrandsByCategory(categorySlug),
    select: (response) => {
      // Kiểm tra cấu trúc dữ liệu và trả về brands
      if (response?.data?.brands) {
        return response.data.brands;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    enabled: !!categorySlug, // Chỉ gọi khi có categorySlug
    staleTime: 1000 * 60 * 10, // Cache 10 phút
    cacheTime: 1000 * 60 * 30, // Giữ trong cache 30 phút
  });
}

export function useAllBrandNames() {
  return useQuery({
    queryKey: ['brands', 'all-names'],
    queryFn: () => brandApi.getAllBrandNames(),
    select: (response) => {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });
}
