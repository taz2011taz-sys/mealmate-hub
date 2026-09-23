export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_pricing_negotiations: {
        Row: {
          approved_by: string | null
          attempts: number
          base_price: number
          branch_count: number
          contract_months: number
          created_at: string
          created_by: string | null
          current_offer: number | null
          discount_reason: string | null
          final_offer: number | null
          human_approved: boolean
          id: string
          max_discount_pct: number
          minimum_price: number
          order_volume: number
          recommendation: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          restaurant_size: string | null
          suggested_offer: number | null
          updated_at: string
          upfront_discount_pct: number
        }
        Insert: {
          approved_by?: string | null
          attempts?: number
          base_price?: number
          branch_count?: number
          contract_months?: number
          created_at?: string
          created_by?: string | null
          current_offer?: number | null
          discount_reason?: string | null
          final_offer?: number | null
          human_approved?: boolean
          id?: string
          max_discount_pct?: number
          minimum_price?: number
          order_volume?: number
          recommendation?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_size?: string | null
          suggested_offer?: number | null
          updated_at?: string
          upfront_discount_pct?: number
        }
        Update: {
          approved_by?: string | null
          attempts?: number
          base_price?: number
          branch_count?: number
          contract_months?: number
          created_at?: string
          created_by?: string | null
          current_offer?: number | null
          discount_reason?: string | null
          final_offer?: number | null
          human_approved?: boolean
          id?: string
          max_discount_pct?: number
          minimum_price?: number
          order_volume?: number
          recommendation?: string | null
          restaurant_id?: string | null
          restaurant_name?: string | null
          restaurant_size?: string | null
          suggested_offer?: number | null
          updated_at?: string
          upfront_discount_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_pricing_negotiations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          delivery_radius_km: number | null
          id: string
          is_active: boolean
          manager_name: string | null
          name: string
          opening_hours: Json
          phone: string | null
          pickup_enabled: boolean
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          delivery_radius_km?: number | null
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name: string
          opening_hours?: Json
          phone?: string | null
          pickup_enabled?: boolean
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          delivery_radius_km?: number | null
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name?: string
          opening_hours?: Json
          phone?: string | null
          pickup_enabled?: boolean
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string | null
          id: string
          last_order_at: string | null
          name: string
          phone: string | null
          restaurant_id: string
          total_orders: number
          total_spent: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_order_at?: string | null
          name: string
          phone?: string | null
          restaurant_id: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_order_at?: string | null
          name?: string
          phone?: string | null
          restaurant_id?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          period_end: string | null
          period_start: string | null
          reference: string
          restaurant_id: string
          source: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          reference: string
          restaurant_id: string
          source?: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          reference?: string
          restaurant_id?: string
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[]
          branch_id: string | null
          calories: number | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_halaal: boolean
          is_spicy: boolean
          is_vegan: boolean
          is_vegetarian: boolean
          name: string
          position: number
          prep_time_minutes: number | null
          price: number
          restaurant_id: string
          sku: string | null
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          branch_id?: string | null
          calories?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_halaal?: boolean
          is_spicy?: boolean
          is_vegan?: boolean
          is_vegetarian?: boolean
          name: string
          position?: number
          prep_time_minutes?: number | null
          price?: number
          restaurant_id: string
          sku?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          branch_id?: string | null
          calories?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_halaal?: boolean
          is_spicy?: boolean
          is_vegan?: boolean
          is_vegetarian?: boolean
          name?: string
          position?: number
          prep_time_minutes?: number | null
          price?: number
          restaurant_id?: string
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_groups: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          max_select: number
          menu_item_id: string | null
          name: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          max_select?: number
          menu_item_id?: string | null
          name: string
          restaurant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          max_select?: number
          menu_item_id?: string | null
          name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modifier_groups_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_groups_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      modifiers: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_available: boolean
          name: string
          price: number
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_available?: boolean
          name: string
          price?: number
          restaurant_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_available?: boolean
          name?: string
          price?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modifiers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifiers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          announcements: boolean
          billing: boolean
          id: string
          new_orders: boolean
          order_updates: boolean
          promotions: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          announcements?: boolean
          billing?: boolean
          id?: string
          new_orders?: boolean
          order_updates?: boolean
          promotions?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          announcements?: boolean
          billing?: boolean
          id?: string
          new_orders?: boolean
          order_updates?: boolean
          promotions?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          restaurant_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          restaurant_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          restaurant_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_modifiers: {
        Row: {
          created_at: string
          id: string
          name: string
          order_item_id: string
          price: number
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_item_id: string
          price?: number
          restaurant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_item_id?: string
          price?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_modifiers_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_modifiers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          name: string
          notes: string | null
          order_id: string
          quantity: number
          restaurant_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name: string
          notes?: string | null
          order_id: string
          quantity?: number
          restaurant_id: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          restaurant_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string | null
          completed_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_fee: number
          discount: number
          fulfillment: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          placed_at: string
          promotion_id: string | null
          restaurant_id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number
          discount?: number
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string
          promotion_id?: string | null
          restaurant_id: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number
          discount?: number
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string
          promotion_id?: string | null
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          entitlement: string
          features: Json
          id: string
          is_active: boolean
          name: string
          position: number
          price_zar: number
          revenuecat_product_id: string | null
        }
        Insert: {
          created_at?: string
          entitlement: string
          features?: Json
          id: string
          is_active?: boolean
          name: string
          position?: number
          price_zar: number
          revenuecat_product_id?: string | null
        }
        Update: {
          created_at?: string
          entitlement?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          price_zar?: number
          revenuecat_product_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_redemptions: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          promotion_id: string
          restaurant_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          promotion_id: string
          restaurant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          promotion_id?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          branch_id: string | null
          created_at: string
          description: string | null
          eligible_item_ids: string[]
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          minimum_order: number
          name: string
          restaurant_id: string
          revenue_generated: number
          starts_at: string | null
          type: Database["public"]["Enums"]["promo_type"]
          updated_at: string
          uses: number
          value: number
          views: number
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          description?: string | null
          eligible_item_ids?: string[]
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          minimum_order?: number
          name: string
          restaurant_id: string
          revenue_generated?: number
          starts_at?: string | null
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
          uses?: number
          value?: number
          views?: number
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          description?: string | null
          eligible_item_ids?: string[]
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          minimum_order?: number
          name?: string
          restaurant_id?: string
          revenue_generated?: number
          starts_at?: string | null
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
          uses?: number
          value?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_members: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          is_active: boolean
          restaurant_id: string
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          restaurant_id: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          restaurant_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          cuisine: string | null
          delivery_enabled: boolean
          description: string | null
          email: string | null
          id: string
          is_suspended: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          minimum_order: number
          name: string
          onboarding_complete: boolean
          opening_hours: Json
          owner_id: string
          owner_name: string | null
          phone: string | null
          pickup_enabled: boolean
          prep_time_minutes: number
          province: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          cuisine?: string | null
          delivery_enabled?: boolean
          description?: string | null
          email?: string | null
          id?: string
          is_suspended?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          minimum_order?: number
          name: string
          onboarding_complete?: boolean
          opening_hours?: Json
          owner_id: string
          owner_name?: string | null
          phone?: string | null
          pickup_enabled?: boolean
          prep_time_minutes?: number
          province?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          cuisine?: string | null
          delivery_enabled?: boolean
          description?: string | null
          email?: string | null
          id?: string
          is_suspended?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          minimum_order?: number
          name?: string
          onboarding_complete?: boolean
          opening_hours?: Json
          owner_id?: string
          owner_name?: string | null
          phone?: string | null
          pickup_enabled?: boolean
          prep_time_minutes?: number
          province?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      staff_invites: {
        Row: {
          accepted_at: string | null
          branch_id: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          restaurant_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: string
        }
        Insert: {
          accepted_at?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          restaurant_id: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
        }
        Update: {
          accepted_at?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          restaurant_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          created_at: string
          entitlement: string | null
          event_type: string
          id: string
          payload: Json
          product_id: string | null
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string
          entitlement?: string | null
          event_type: string
          id?: string
          payload?: Json
          product_id?: string | null
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string
          entitlement?: string | null
          event_type?: string
          id?: string
          payload?: Json
          product_id?: string | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          app_user_id: string | null
          created_at: string
          entitlement: string | null
          expiration_date: string | null
          id: string
          is_trial: boolean
          last_synced_at: string | null
          plan_id: string | null
          product_id: string | null
          restaurant_id: string
          revenuecat_customer_id: string | null
          status: Database["public"]["Enums"]["sub_status"]
          updated_at: string
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string
          entitlement?: string | null
          expiration_date?: string | null
          id?: string
          is_trial?: boolean
          last_synced_at?: string | null
          plan_id?: string | null
          product_id?: string | null
          restaurant_id: string
          revenuecat_customer_id?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          updated_at?: string
        }
        Update: {
          app_user_id?: string | null
          created_at?: string
          entitlement?: string | null
          expiration_date?: string | null
          id?: string
          is_trial?: boolean
          last_synced_at?: string | null
          plan_id?: string | null
          product_id?: string | null
          restaurant_id?: string
          revenuecat_customer_id?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          priority: string
          restaurant_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          priority?: string
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          priority?: string
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_manager: { Args: { _restaurant_id: string }; Returns: boolean }
      is_member: { Args: { _restaurant_id: string }; Returns: boolean }
      is_owner: { Args: { _restaurant_id: string }; Returns: boolean }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_published_restaurant: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
      member_role_for: {
        Args: { _restaurant_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["member_role"]
      }
      owns_customer: { Args: { _customer_id: string }; Returns: boolean }
      owns_order: { Args: { _order_id: string }; Returns: boolean }
    }
    Enums: {
      fulfillment_type: "delivery" | "pickup"
      member_role: "owner" | "manager" | "staff"
      order_status:
        | "new"
        | "accepted"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "completed"
        | "cancelled"
        | "rejected"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      platform_role: "admin"
      promo_type:
        | "percentage"
        | "fixed"
        | "bogo"
        | "free_item"
        | "free_delivery"
      sub_status:
        | "none"
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      fulfillment_type: ["delivery", "pickup"],
      member_role: ["owner", "manager", "staff"],
      order_status: [
        "new",
        "accepted",
        "preparing",
        "ready",
        "out_for_delivery",
        "completed",
        "cancelled",
        "rejected",
      ],
      payment_status: ["pending", "paid", "refunded", "failed"],
      platform_role: ["admin"],
      promo_type: ["percentage", "fixed", "bogo", "free_item", "free_delivery"],
      sub_status: [
        "none",
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
