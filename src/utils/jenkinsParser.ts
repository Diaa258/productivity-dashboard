import { JenkinsTestCase, JenkinsReportData } from '@/types';

interface JenkinsSuiteNode {
  name: string;
  cases?: JenkinsTestCase[];
  subSuites?: JenkinsSuiteNode[];
}

interface JenkinsRawSuite {
  name: string;
  cases: Array<{
    name: string;
    status: string;
    tags?: string[];
  }>;
  subSuites?: JenkinsRawSuite[];
}

export const parseJenkinsReport = (data: any): JenkinsTestCase[] => {
  const testCases: JenkinsTestCase[] = [];
  
  const extractTestCaseId = (tags: string[] | undefined): string | undefined => {
    if (!tags) return undefined;
    
    for (const tag of tags) {
      // Match @automationtestcase=123
      const automationMatch = tag.match(/@automationtestcase=(\d+)/);
      if (automationMatch) return automationMatch[1];
      
      // Match @TNOQRL-123
      const tnoqrlMatch = tag.match(/@TNOQRL-(\d+)/);
      if (tnoqrlMatch) return `TNOQRL-${tnoqrlMatch[1]}`;
    }
    
    return undefined;
  };
  
  const parseScenarioName = (name: string): { feature: string; scenario: string } => {
    // Try to extract feature and scenario from the name
    // Example: "Login Feature - User can login with valid credentials"
    const parts = name.split(' - ');
    if (parts.length >= 2) {
      return {
        feature: parts[0].trim(),
        scenario: parts.slice(1).join(' - ').trim(),
      };
    }
    
    // Fallback: use the whole name as scenario
    return {
      feature: 'General',
      scenario: name.trim(),
    };
  };
  
  const traverseSuites = (suites: any[], subGroup: string = 'Default') => {
    suites.forEach((suite) => {
      if (suite.cases && Array.isArray(suite.cases)) {
        suite.cases.forEach((testCase: any) => {
          const { feature, scenario } = parseScenarioName(testCase.name || '');
          const testCaseId = extractTestCaseId(testCase.tags);
          
          testCases.push({
            subGroup,
            feature,
            scenario,
            status: testCase.status || 'UNKNOWN',
            testCaseId,
          });
        });
      }
      
      if (suite.subSuites && Array.isArray(suite.subSuites)) {
        traverseSuites(suite.subSuites, suite.name || subGroup);
      }
      
      // Handle nested suites structure
      if (suite.suites && Array.isArray(suite.suites)) {
        traverseSuites(suite.suites, suite.name || subGroup);
      }
    });
  };
  
  // Handle different possible JSON structures
  if (data.suites && Array.isArray(data.suites)) {
    traverseSuites(data.suites);
  } else if (data.children && Array.isArray(data.children)) {
    traverseSuites(data.children);
  } else if (Array.isArray(data)) {
    traverseSuites(data);
  }
  
  return testCases;
};

export const exportToCSV = (testCases: JenkinsTestCase[]): string => {
  const headers = ['Sub Group', 'Feature', 'Scenario', 'Status', 'Test Case ID'];
  const rows = testCases.map(tc => [
    tc.subGroup,
    tc.feature,
    tc.scenario,
    tc.status,
    tc.testCaseId || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csvContent;
};
