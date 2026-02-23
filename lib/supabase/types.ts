// =============================================================================
// Drapit — Database Types
// =============================================================================
// TypeScript types mirroring the Supabase schema.
// Keep in sync with supabase/migrations/001_initial.sql.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums / Literals
// ---------------------------------------------------------------------------
export type Plan = 'starter' | 'growth' | 'enterprise';
export type TryOnStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

// ---------------------------------------------------------------------------
// Row types (matches DB columns 1-to-1)
// ---------------------------------------------------------------------------

export interface Shop {
    id: string;
    created_at: string;
    owner_id: string | null;
    name: string;
    email: string;
    domain: string | null;
    plan: Plan;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    monthly_tryon_limit: number;
    tryons_this_month: number;
}

export interface ApiKey {
    id: string;
    shop_id: string;
    key_hash: string;
    key_prefix: string | null;
    name: string | null;
    created_at: string;
    last_used_at: string | null;
    is_active: boolean;
}

export interface TryOn {
    id: string;
    shop_id: string;
    product_id: string | null;
    product_image_url: string | null;
    user_photo_url: string | null;
    result_image_url: string | null;
    status: TryOnStatus;
    replicate_prediction_id: string | null;
    created_at: string;
    completed_at: string | null;
    converted: boolean;
    converted_at: string | null;
}

export interface Product {
    id: string;
    shop_id: string;
    external_id: string | null;
    name: string;
    image_url: string | null;
    price: number | null;
    buy_url: string | null;
    created_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (omit server-generated fields)
// ---------------------------------------------------------------------------

export type ShopInsert = Omit<Shop, 'id' | 'created_at' | 'tryons_this_month'> & {
    id?: string;
    created_at?: string;
    tryons_this_month?: number;
};

export type ApiKeyInsert = Omit<ApiKey, 'id' | 'created_at' | 'last_used_at'> & {
    id?: string;
    created_at?: string;
};

export type TryOnInsert = Omit<TryOn, 'id' | 'created_at' | 'completed_at' | 'converted' | 'converted_at'> & {
    id?: string;
    created_at?: string;
};

export type ProductInsert = Omit<Product, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

// ---------------------------------------------------------------------------
// Update types (all fields optional except id)
// ---------------------------------------------------------------------------

export type ShopUpdate = Partial<Omit<Shop, 'id'>> & { id: string };
export type ApiKeyUpdate = Partial<Omit<ApiKey, 'id'>> & { id: string };
export type TryOnUpdate = Partial<Omit<TryOn, 'id'>> & { id: string };
export type ProductUpdate = Partial<Omit<Product, 'id'>> & { id: string };

// ---------------------------------------------------------------------------
// Supabase Database type (for typed client)
// ---------------------------------------------------------------------------

export interface Database {
    public: {
        Tables: {
            shops: {
                Row: Shop;
                Insert: ShopInsert;
                Update: Partial<ShopInsert>;
                Relationships: [];
            };
            api_keys: {
                Row: ApiKey;
                Insert: ApiKeyInsert;
                Update: Partial<ApiKeyInsert>;
                Relationships: [
                    {
                        foreignKeyName: 'api_keys_shop_id_fkey';
                        columns: ['shop_id'];
                        isOneToOne: false;
                        referencedRelation: 'shops';
                        referencedColumns: ['id'];
                    },
                ];
            };
            tryons: {
                Row: TryOn;
                Insert: TryOnInsert;
                Update: Partial<TryOnInsert>;
                Relationships: [
                    {
                        foreignKeyName: 'tryons_shop_id_fkey';
                        columns: ['shop_id'];
                        isOneToOne: false;
                        referencedRelation: 'shops';
                        referencedColumns: ['id'];
                    },
                ];
            };
            products: {
                Row: Product;
                Insert: ProductInsert;
                Update: Partial<ProductInsert>;
                Relationships: [
                    {
                        foreignKeyName: 'products_shop_id_fkey';
                        columns: ['shop_id'];
                        isOneToOne: false;
                        referencedRelation: 'shops';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            increment_tryons_count: {
                Args: { shop_row_id: string };
                Returns: undefined;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
