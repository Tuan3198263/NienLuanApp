import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export function useProductsByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: () => productApi.getProductsByCategorySlug(categorySlug),
    select: (response) => response.data.products,
    enabled: !!categorySlug, // Chỉ thực hiện khi có categorySlug
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProductBySlug(slug),
    select: (response) => response.data.product,
    enabled: !!slug, // Chỉ thực hiện khi có slug
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData) => productApi.addReview(reviewData),
    // Khi mutation thành công, invalidate các queries liên quan
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productSlug],
      });
    },
  });
}

// Thêm các hooks khác theo nhu cầu
export function useSearchProducts() {
  return {
    search: (query: string) => {
      return useQuery({
        queryKey: ['products', 'search', query],
        queryFn: () => productApi.searchProducts(query),
        select: (response) => response.data.products,
        enabled: query.length > 0, // Chỉ tìm kiếm khi query không trống
      });
    }
  };
}
