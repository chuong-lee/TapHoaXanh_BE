export class CreateProductVariantDto {
  variant_name: string;
  price_modifier: number;
  stock: number;
  productId: number; // Foreign key to associate with a product
}
