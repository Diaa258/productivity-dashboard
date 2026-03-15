'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, RefreshCw, Download, Search, Filter } from 'lucide-react';
import { JenkinsTestCase } from '@/types';

export default function JenkinsReportWidget() {
  const [testCases, setTestCases] = useState<JenkinsTestCase[]>([]);
  const [buildNumber, setBuildNumber] = useState('');
  const [availableBuilds, setAvailableBuilds] = useState<Array<{ number: number; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBuilds = async () => {
    try {
      const response = await fetch('/api/jenkins/builds');
      const data = await response.json();
      if (data.success) {
        setAvailableBuilds(data.data);
        if (data.data.length > 0 && !buildNumber) {
          setBuildNumber(data.data[0].number.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching builds:', error);
    }
  };

  const fetchReport = async (buildNum: string) => {
    if (!buildNum) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/jenkins/report?buildNumber=${buildNum}`);
      const data = await response.json();
      if (data.success) {
        setTestCases(data.data);
      }
    } catch (error) {
      console.error('Error fetching Jenkins report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  useEffect(() => {
    if (buildNumber) {
      fetchReport(buildNumber);
    }
  }, [buildNumber]);

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = testCase.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.subGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (testCase.testCaseId && testCase.testCaseId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || testCase.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'failed':
      case 'fail':
        return 'text-red-600 bg-red-50';
      case 'skipped':
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/jenkins/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCases: filteredTestCases }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jenkins-report-build-${buildNumber}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const getStatusStats = () => {
    const stats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: filteredTestCases.length,
    };
    
    filteredTestCases.forEach(testCase => {
      const status = testCase.status.toLowerCase();
      if (status.includes('pass')) stats.passed++;
      else if (status.includes('fail')) stats.failed++;
      else if (status.includes('skip') || status.includes('pending')) stats.skipped++;
    });
    
    return stats;
  };

  const stats = getStatusStats();

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Jenkins Automation Results
        </CardTitle>
        <CardDescription>
          Test automation report viewer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Build Selector */}
          <div className="flex gap-2">
            <select
              value={buildNumber}
              onChange={(e) => setBuildNumber(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Build</option>
              {availableBuilds.map((build) => (
                <option key={build.number} value={build.number}>
                  Build #{build.number}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchReport(buildNumber)}
              disabled={loading || !buildNumber}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Status Stats */}
          {buildNumber && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-lg font-bold text-green-600">{stats.passed}</div>
                <div className="text-xs text-gray-600">Passed</div>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="text-lg font-bold text-red-600">{stats.failed}</div>
                <div className="text-xs text-gray-600">Failed</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="text-lg font-bold text-yellow-600">{stats.skipped}</div>
                <div className="text-xs text-gray-600">Skipped</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={exportToCSV}
              disabled={filteredTestCases.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Test Cases Table */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Sub Group</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[100px]">Test Case ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestCases.slice(0, 10).map((testCase, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{testCase.subGroup}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate" title={testCase.feature}>
                      {testCase.feature}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate" title={testCase.scenario}>
                      {testCase.scenario}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testCase.status)}`}>
                        {testCase.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {testCase.testCaseId || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTestCases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading test cases...' : 'No test cases found'}
            </div>
          )}

          {filteredTestCases.length > 10 && (
            <div className="text-sm text-gray-600 text-center">
              Showing 10 of {filteredTestCases.length} test cases
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
