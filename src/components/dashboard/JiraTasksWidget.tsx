'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, RefreshCw, Search, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { JiraTicket } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function JiraTasksWidget() {
  const { credentials } = useAuth();
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [automationTestCases, setAutomationTestCases] = useState<JiraTicket[]>([]);
  const [allTickets, setAllTickets] = useState<JiraTicket[]>([]);
  const [defects, setDefects] = useState<JiraTicket[]>([]);
  const [latestTask, setLatestTask] = useState<JiraTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAutomationTestCases, setLoadingAutomationTestCases] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [integrationTestCases, setIntegrationTestCases] = useState<JiraTicket[]>([]);
  const [loadingIntegration, setLoadingIntegration] = useState(false);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [allIntegrationTestCases, setAllIntegrationTestCases] = useState<JiraTicket[]>([]);
  const [loadingAllIntegration, setLoadingAllIntegration] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'automation' | 'all' | 'latest' | 'defects' | 'integration' | 'allintegration'>('tasks');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState('TNOQPAY');
  const itemsPerPage = 10;

  useEffect(() => {
    if (credentials) {
      fetchTickets();
    }
  }, [credentials, selectedProject]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      if (!credentials || !credentials.username || !credentials.password || !credentials.baseUrl) {
        console.log('Jira credentials not available');
        setLoading(false);
        return;
      }

      console.log('Fetching tasks with ORDER BY created DESC...');
      setTickets([]);
      setAutomationTestCases([]);
      setAllTickets([]);
      setLatestTask(null);
      
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(7);
      const response = await fetch(`/api/jira/tickets?jql=assignee = currentUser() AND project = ${selectedProject} AND issuetype = "Task" ORDER BY created DESC&t=${timestamp}&r=${randomId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-jira-base-url': credentials.baseUrl,
        },
      });
      
      const data = await response.json();
      console.log('Tasks response:', data);
      if (data.success) {
        console.log('=== FRONTEND TICKET ANALYSIS ===');
        console.log('All tickets data:', data.data.length, 'tasks');
        
        const allTickets = data.data;
        console.log('Using all tasks:', allTickets.length, 'tasks');
        
        if (allTickets.length > 0) {
          console.log('First ticket:', {
            id: allTickets[0].id,
            created: allTickets[0].created,
            lastUpdated: allTickets[0].lastUpdated,
            summary: allTickets[0].summary?.substring(0, 50) + '...'
          });
          console.log('Last ticket:', {
            id: allTickets[allTickets.length - 1].id,
            created: allTickets[allTickets.length - 1].created,
            lastUpdated: allTickets[allTickets.length - 1].lastUpdated,
            summary: allTickets[allTickets.length - 1].summary?.substring(0, 50) + '...'
          });
          
          const firstDate = new Date(allTickets[0].created || allTickets[0].lastUpdated);
          const lastDate = new Date(allTickets[allTickets.length - 1].created || allTickets[allTickets.length - 1].lastUpdated);
          console.log('Date range:', {
            first: firstDate.toISOString(),
            last: lastDate.toISOString(),
            diffDays: (firstDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          });
          
          const hasValidCreated = allTickets.every((ticket: JiraTicket) => ticket.created && ticket.created !== ticket.lastUpdated);
          console.log('All tickets have valid created dates:', hasValidCreated);
        }
        
        setTickets(allTickets);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching Jira tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTickets = async () => {
    setLoadingAll(true);
    try {
      if (!credentials || !credentials.username || !credentials.password || !credentials.baseUrl) {
        setLoadingAll(false);
        return;
      }

      const response = await fetch(`/api/jira/tickets?jql=(creator = currentUser() OR assignee = currentUser()) AND project = ${selectedProject} ORDER BY created DESC`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
          'Content-Type': 'application/json',
          'x-jira-base-url': credentials.baseUrl,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setAllTickets(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching all tickets:', error);
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchDefects = async () => {
    setLoadingDefects(true);
    try {
      if (!credentials || !credentials.username || !credentials.password || !credentials.baseUrl) {
        setLoadingDefects(false);
        return;
      }

      const response = await fetch(`/api/jira/tickets?jql=creator = currentUser() AND project = ${selectedProject} AND issuetype = "Defect" ORDER BY created DESC`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
          'Content-Type': 'application/json',
          'x-jira-base-url': credentials.baseUrl,
        },
      });
      
      const data = await response.json();
      console.log('=== DEFECTS ANALYSIS ===');
      console.log('Defects response:', data);
      if (data.success) {
        console.log('Defects data length:', data.data.length, 'defects');
        if (data.data.length > 0) {
          console.log('First defect:', {
            id: data.data[0].id,
            created: data.data[0].created,
            lastUpdated: data.data[0].lastUpdated,
            summary: data.data[0].summary?.substring(0, 50) + '...'
          });
          console.log('Last defect:', {
            id: data.data[data.data.length - 1].id,
            created: data.data[data.data.length - 1].created,
            lastUpdated: data.data[data.data.length - 1].lastUpdated,
            summary: data.data[data.data.length - 1].summary?.substring(0, 50) + '...'
          });
        }
        setDefects(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching defects:', error);
    } finally {
      setLoadingDefects(false);
    }
  };

  const fetchAutomationTestCases = async () => {
    setLoadingAutomationTestCases(true);
    try {
      const response = await fetch('/api/automation-test-cases');
      const data = await response.json();
      console.log('=== AUTOMATION TEST CASES ANALYSIS ===');
      console.log('Automation test cases response:', data);
      if (data.success) {
        console.log('Automation test cases data length:', data.data.length, 'test cases');
        if (data.data.length > 0) {
          console.log('First automation test case:', {
            id: data.data[0].id,
            created: data.data[0].created,
            lastUpdated: data.data[0].lastUpdated,
            summary: data.data[0].summary?.substring(0, 50) + '...'
          });
        }
        setAutomationTestCases(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching automation test cases:', error);
    } finally {
      setLoadingAutomationTestCases(false);
    }
  };

  const fetchIntegrationTestCases = async () => {
    setLoadingIntegration(true);
    try {
      if (!credentials || !credentials.username || !credentials.password || !credentials.baseUrl) {
        setLoadingIntegration(false);
        return;
      }

      const response = await fetch(`/api/jira/tickets?jql=issuetype = "Test Case" AND "Test Type" = Integration AND status in ("Automation Executed", Merged, Closed) AND status not in (Decommissioned) AND Domains = "Payments" AND "Automation Engineer" = currentUser() ORDER BY created DESC`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
          'Content-Type': 'application/json',
          'x-jira-base-url': credentials.baseUrl,
        },
      });
      
      const data = await response.json();
      console.log('=== INTEGRATION TEST CASES ANALYSIS ===');
      console.log('Integration test cases response:', data);
      if (data.success) {
        console.log('Integration test cases data length:', data.data.length, 'test cases');
        if (data.data.length > 0) {
          console.log('First integration test case:', {
            id: data.data[0].id,
            created: data.data[0].created,
            lastUpdated: data.data[0].lastUpdated,
            summary: data.data[0].summary?.substring(0, 50) + '...'
          });
        }
        setIntegrationTestCases(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching integration test cases:', error);
    } finally {
      setLoadingIntegration(false);
    }
  };

  const fetchAllIntegrationTestCases = async () => {
    setLoadingAllIntegration(true);
    try {
      if (!credentials || !credentials.username || !credentials.password || !credentials.baseUrl) {
        setLoadingAllIntegration(false);
        return;
      }

      const response = await fetch(`/api/jira/tickets?jql=issuetype = "Test Case" AND "Test Type" = Integration AND status not in ("Automation Executed", Merged, Closed) AND status not in (Decommissioned) AND Domains = "Payments" AND "Automation Engineer" = V-Diaaeldin.saved ORDER BY created DESC`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
          'Content-Type': 'application/json',
          'x-jira-base-url': credentials.baseUrl,
        },
      });
      
      const data = await response.json();
      console.log('=== ALL INTEGRATION TEST CASES ANALYSIS ===');
      console.log('All integration test cases response:', data);
      if (data.success) {
        console.log('All integration test cases data length:', data.data.length, 'test cases');
        if (data.data.length > 0) {
          console.log('First all integration test case:', {
            id: data.data[0].id,
            created: data.data[0].created,
            lastUpdated: data.data[0].lastUpdated,
            summary: data.data[0].summary?.substring(0, 50) + '...'
          });
        }
        setAllIntegrationTestCases(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching all integration test cases:', error);
    } finally {
      setLoadingAllIntegration(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (credentials && credentials.username && credentials.password && credentials.baseUrl) {
      console.log('=== MOUNTING JIRA WIDGET ===');
      console.log('Fetching all data with created DESC ordering...');
      fetchTickets();
      fetchAutomationTestCases();
      fetchAllTickets();
      fetchIntegrationTestCases();
      fetchAllIntegrationTestCases();
      fetchDefects();
    }
  }, [credentials]);

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || ticket.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

  const filteredAllTickets = allTickets
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || ticket.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

  const filteredAutomationTestCases = automationTestCases
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

  const filteredDefects = defects
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

  const filteredIntegrationTestCases = integrationTestCases
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

  const filteredAllIntegrationTestCases = allIntegrationTestCases
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

  const currentData = activeTab === 'tasks' ? filteredTickets : 
                    activeTab === 'automation' ? filteredAutomationTestCases :
                    activeTab === 'integration' ? filteredIntegrationTestCases :
                    activeTab === 'allintegration' ? filteredAllIntegrationTestCases :
                    activeTab === 'latest' ? (latestTask ? [latestTask] : []) : 
                    activeTab === 'defects' ? filteredDefects :
                    filteredAllTickets;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentData.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'closed':
        return 'text-green-600 bg-green-50';
      case 'in progress':
      case 'in review':
        return 'text-blue-600 bg-blue-50';
      case 'to do':
      case 'open':
        return 'text-slate-600 bg-slate-50';
      case 'blocked':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return '';
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
      case 'lowest':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: 'tasks' | 'automation' | 'all' | 'latest' | 'defects' | 'integration' | 'allintegration') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (activeTab === 'tasks') {
      fetchTickets();
    } else if (activeTab === 'automation') {
      fetchAutomationTestCases();
    } else if (activeTab === 'integration') {
      fetchIntegrationTestCases();
    } else if (activeTab === 'allintegration') {
      fetchAllIntegrationTestCases();
    } else if (activeTab === 'latest') {
      // fetchLatestTask();
    } else if (activeTab === 'defects') {
      fetchDefects();
    } else {
      fetchAllTickets();
    }
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              Jira Tasks
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your Jira tickets and tasks
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">Project:</label>
            <select 
              value={selectedProject} 
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setTickets([]);
                setAutomationTestCases([]);
                setAllTickets([]);
                setDefects([]);
                setIntegrationTestCases([]);
                setAllIntegrationTestCases([]);
                setLatestTask(null);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TNOQRL">TNOQRL</option>
              <option value="TNOQPAY">TNOQPAY</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto">
            <button
              className={`px-3 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('tasks')}
            >
              Tasks ({filteredTickets.length})
            </button>
            <button
              className={`px-3 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'automation'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('automation')}
            >
              Backlog ({filteredAutomationTestCases.length})
            </button>
            <button
              className={`px-3 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'defects'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('defects')}
            >
              Defects ({filteredDefects.length})
            </button>
            <button
              className={`px-3 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'integration'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('integration')}
            >
              Completed ({filteredIntegrationTestCases.length})
            </button>
            <button
              className={`px-3 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'allintegration'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('allintegration')}
            >
              Not Completed ({filteredAllIntegrationTestCases.length})
            </button>
          </div>

          {activeTab !== 'latest' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={loading || loadingAutomationTestCases || loadingAll || loadingIntegration || loadingDefects || loadingAllIntegration}
                className="h-10 w-10"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || loadingAutomationTestCases || loadingAll || loadingIntegration || loadingDefects || loadingAllIntegration) ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}

          {(activeTab === 'tasks' || activeTab === 'all') && (
            <div className="flex gap-2 flex-wrap">
              {['all', 'To Do', 'In Progress', 'Done'].map(status => (
                <Button
                  key={status}
                  variant={filter === status.toLowerCase() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status.toLowerCase())}
                  className="text-xs h-8 px-2 sm:px-3"
                >
                  {status}
                </Button>
              ))}
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">Title</TableHead>
                  <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="w-[60px] sm:w-[80px] text-xs sm:text-sm">Priority</TableHead>
                  <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      <a
                        href={`${credentials?.baseUrl || ''}/browse/${ticket.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 text-xs sm:text-sm"
                      >
                        {ticket.id}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[150px] sm:max-w-xs truncate text-xs sm:text-sm" title={ticket.summary}>
                      {ticket.summary}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <span className={`text-xs sm:text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <span className="text-xs text-slate-600 bg-slate-100 px-1 sm:px-2 py-1 rounded">
                        {ticket.issuetype || '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {currentItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {(loading || 
                (activeTab === 'automation' && loadingAutomationTestCases) || 
                (activeTab === 'integration' && loadingIntegration) ||
                (activeTab === 'allintegration' && loadingAllIntegration) ||
                (activeTab === 'all' && loadingAll) ||
                (activeTab === 'defects' && loadingDefects)) ? 'Loading...' : `No ${activeTab} found`}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of {currentData.length} {activeTab}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <span className="text-xs sm:text-sm font-medium px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
