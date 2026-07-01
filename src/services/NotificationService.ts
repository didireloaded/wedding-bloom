import { BaseRepository } from "./repository/BaseRepository";
import { supabase } from "@/lib/supabase";

export interface SystemNotification {
  id: string;
  wedding_id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  created_at: string;
}

class NotificationDomainService extends BaseRepository<SystemNotification> {
  constructor() {
    super("notifications");
  }

  async sendNotification(weddingId: string, title: string, message: string, type = "info"): Promise<SystemNotification | null> {
    const res = await this.create({
      wedding_id: weddingId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    });
    return res.data;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const res = await this.update(notificationId, { read: true });
    return !!res.data;
  }

  async getUnreadCount(weddingId: string): Promise<number> {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", weddingId)
      .eq("read", false);
    return count || 0;
  }
}

export const NotificationService = new NotificationDomainService();
