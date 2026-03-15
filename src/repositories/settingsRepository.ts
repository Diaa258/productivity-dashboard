import { prisma } from '@/config/database';

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
