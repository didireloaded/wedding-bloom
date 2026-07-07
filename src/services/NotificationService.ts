import { NotificationRepository } from "@/repositories";

export interface SystemNotification {
  id: string;
  wedding_id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  created_at: string;
}

class NotificationDomainService extends NotificationRepository {
  constructor() {
    super();
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
}

export const NotificationService = new NotificationDomainService();
