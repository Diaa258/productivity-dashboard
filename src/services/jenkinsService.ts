import axios from 'axios';
import { config } from '@/config/env';
import { JenkinsTestCase } from '@/types';
import { parseJenkinsReport, exportToCSV } from '@/utils/jenkinsParser';

/**
 * خدمة جينكينز - JenkinsService
 * 
 * هذه الكلاس مسؤولة عن التعامل مع نظام Jenkins لإدارة البيلدات والتقارير الأوتوماتيكية
 * 
 * الوظائف الرئيسية:
 * - جلب تقارير الاختبار الأوتوماتيكي من Jenkins builds
 * - الحصول على قائمة بالبنود الأخيرة (recent builds)
 * - تصفية حالات الاختبار بناءً على الحالة والمجموعة والميزة
 * - تصدير البيانات إلى صيغة CSV
 * - استخراج القيم الفريدة للتصفية (subgroups, features, statuses)
 * 
 * التقنيات المستخدمة:
 * - Axios للتعامل مع Jenkins REST API
 * - JSON parsing لتحليل تقارير الاختبار
 * - CSV export لتصدير البيانات
 * 
 * الملاحظات:
 * - يدعم التعامل مع Payment Domain Automation Reports
 * - يتضمن أدوات تصفية متقدمة لحالات الاختبار
 * - يدعم استخراج بيانات من suites.json
 * - يوفر واجهة سهلة للبحث والتصفية
 */
export class JenkinsService {
  private baseUrl: string;
  private jobPath: string;

  constructor() {
    this.baseUrl = config.jenkins.baseUrl;
    this.jobPath = config.jenkins.jobPath;
  }

  async getAutomationReport(buildNumber: number): Promise<JenkinsTestCase[]> {
    try {
      const url = `${this.baseUrl}/${this.jobPath}/${buildNumber}/Payment_20Domain_20Automation_20Report/data/suites.json`;
      
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const testCases = parseJenkinsReport(response.data);
      return testCases;
    } catch (error) {
      console.error(`Error fetching Jenkins report for build ${buildNumber}:`, error);
      throw new Error(`Failed to fetch Jenkins report for build ${buildNumber}`);
    }
  }

  async getRecentBuilds(count: number = 10): Promise<Array<{ number: number; url: string }>> {
    try {
      const url = `${this.baseUrl}/${this.jobPath}/api/json`;
      
      const response = await axios.get(url, {
        params: {
          tree: 'builds[number,url]',
        },
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.data.builds
        .slice(0, count)
        .map((build: any) => ({
          number: build.number,
          url: build.url,
        }));
    } catch (error) {
      console.error('Error fetching recent builds:', error);
      throw new Error('Failed to fetch recent builds');
    }
  }

  exportToCSV(testCases: JenkinsTestCase[]): string {
    return exportToCSV(testCases);
  }

  filterTestCases(testCases: JenkinsTestCase[], filters: {
    status?: string;
    subGroup?: string;
    feature?: string;
    search?: string;
  }): JenkinsTestCase[] {
    return testCases.filter(testCase => {
      if (filters.status && testCase.status !== filters.status) {
        return false;
      }
      
      if (filters.subGroup && testCase.subGroup !== filters.subGroup) {
        return false;
      }
      
      if (filters.feature && !testCase.feature.toLowerCase().includes(filters.feature.toLowerCase())) {
        return false;
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          testCase.scenario.toLowerCase().includes(searchTerm) ||
          testCase.feature.toLowerCase().includes(searchTerm) ||
          testCase.subGroup.toLowerCase().includes(searchTerm) ||
          (testCase.testCaseId && testCase.testCaseId.toLowerCase().includes(searchTerm))
        );
      }
      
      return true;
    });
  }

  getUniqueValues(testCases: JenkinsTestCase[]): {
    subGroups: string[];
    features: string[];
    statuses: string[];
  } {
    const subGroups = [...new Set(testCases.map(tc => tc.subGroup))];
    const features = [...new Set(testCases.map(tc => tc.feature))];
    const statuses = [...new Set(testCases.map(tc => tc.status))];
    
    return {
      subGroups: subGroups.sort(),
      features: features.sort(),
      statuses: statuses.sort(),
    };
  }
}

export const jenkinsService = new JenkinsService();
