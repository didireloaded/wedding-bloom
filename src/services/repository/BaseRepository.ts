// @ts-nocheck
import { supabase } from "@/lib/supabase";

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

export class BaseRepository<T extends { id?: string }> {
  constructor(protected tableName: string) {}

  async findById(id: string): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as T, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Repository query failed" };
    }
  }

  async findByWeddingId(weddingId: string, options?: PaginationOptions): Promise<{ data: T[]; error: string | null }> {
    try {
      let query = supabase.from(this.tableName).select("*").eq("wedding_id", weddingId);
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }
      if (options?.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data || []) as T[], error: null };
    } catch (err: any) {
      return { data: [], error: err?.message || "Repository query failed" };
    }
  }

  async create(payload: Partial<T>): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([payload])
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as T, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Repository insert failed" };
    }
  }

  async update(id: string, patch: Partial<T>): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data: data as T, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Repository update failed" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.from(this.tableName).delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || "Repository delete failed" };
    }
  }
}
