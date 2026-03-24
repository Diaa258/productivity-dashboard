import { prisma } from '@/config/database';

/**
 * مستودع الإعدادات - SettingsRepository
 * 
 * هذه الكلاس مسؤولة عن إدارة جميع إعدادات النظام وتخزينها بشكل دائم
 * 
 * الوظائف الرئيسية:
 * - تخزين واسترجاع الإعدادات الفردية (key-value pairs)
 * - الحصول على جميع الإعدادات دفعة واحدة
 * - تحديث الإعدادات الموجودة أو إنشاء جديدة
 * - حذف الإعدادات غير المرغوب فيها
 * 
 * أنواع الإعدادات المدعومة:
 * - إعدادات Jira (URL, credentials)
 * - إعدادات Jenkins (URL, job paths)
 * - الساعات القياسية لكل يوم من أيام الأسبوع
 * - تفضيلات المستخدم والإعدادات الشخصية
 * - إعدادات الإشعارات والتذكيرات
 * 
 * التقنيات المستخدمة:
 * - Prisma ORM للتعامل مع قاعدة البيانات
 * - Upsert operations لتحديث أو إنشاء الإعدادات
 * - Key-value storage pattern للتخزين المرن
 * 
 * الملاحظات:
 * - يستخدم نمط Repository لفصل منطق الوصول للبيانات
 * - يدعم التخزين المرن لأي نوع من الإعدادات
 * - يوفر واجهة بسيطة وموحدة للتعامل مع الإعدادات
 * - يتضمن معالجة أخطاء أساسية
 */
export class SettingsRepository {
  async getSetting(key: string): Promise<string | null> {
    const setting = await prisma.settings.findUnique({
      where: { key },
    });
    
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });
    
    return result;
  }

  async deleteSetting(key: string): Promise<boolean> {
    try {
      await prisma.settings.delete({
        where: { key },
      });
      return true;
    } catch (error) {
      console.error('Error deleting setting:', error);
      return false;
    }
  }
}

export const settingsRepository = new SettingsRepository();
