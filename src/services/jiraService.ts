import axios from 'axios';
import { config } from '@/config/env';
import { JiraTicket } from '@/types';

export class JiraService {
  private baseUrl: string;
  private auth: {
    username: string;
    password: string;
  };

  constructor(settings?: { username: string; password: string; baseUrl: string }) {
    this.baseUrl = settings?.baseUrl || config.jira.baseUrl;
    this.auth = {
      username: settings?.username || config.jira.email,
      password: settings?.password || config.jira.token,
    };
  }

  updateSettings(settings: { username: string; password: string; baseUrl: string }) {
    this.baseUrl = settings.baseUrl;
    this.auth = {
      username: settings.username,
      password: settings.password,
    };
  }

  private getAuthHeader() {
    return {
      Authorization: `Basic ${Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64')}`,
    };
  }

  async getAssignedTickets(jql?: string): Promise<JiraTicket[]> {
    try {
      console.log('=== JIRA SERVICE START ===');
      const defaultJQL = 'assignee = currentUser() AND project = TNOQPAY ORDER BY created DESC';
      const searchJQL = jql || defaultJQL;
      console.log('Using JQL:', searchJQL);
      
      // Try API v2 first, then v3
      const apiVersions = ['/rest/api/2/search', '/rest/api/3/search'];
      let lastError: any = null;
      
      for (const apiPath of apiVersions) {
        try {
          console.log(`Trying: ${this.baseUrl}${apiPath}`);
          console.log(`Using JQL: ${searchJQL}`);
          console.log(`Auth: ${this.auth.username}`);
          
          let allIssues: any[] = [];
          let startAt = 0;
          const maxResults = 100; // JIRA typically allows max 100 per page
          let totalIssues = 0;
          
          do {
            console.log(`Fetching page: startAt=${startAt}, maxResults=${maxResults}`);
            
            const response = await axios.get(
              `${this.baseUrl}${apiPath}`,
              {
                params: {
                  jql: searchJQL,
                  fields: 'summary,status,priority,customfield_10004,customfield_10002,assignee,updated,created,issuetype,issuetype.name,issuetype.id',
                  startAt: startAt,
                  maxResults: maxResults,
                },
                headers: {
                  ...this.getAuthHeader(),
                  'Accept': 'application/json',
                },
                timeout: 10000, // 10 second timeout
              }
            );

            console.log(`Jira response status: ${response.status}`);
            console.log(`Found ${response.data.issues?.length || 0} issues in this page`);
            console.log(`Total issues available: ${response.data.total || 0}`);
            
            if (response.data.issues && response.data.issues.length > 0) {
              allIssues = allIssues.concat(response.data.issues);
              totalIssues = response.data.total || 0;
              
              // Debug: Check first issue fields
              if (allIssues.length === response.data.issues.length) {
                console.log('=== DEBUG INFO ===');
                console.log('First issue fields:', Object.keys(response.data.issues[0].fields));
                console.log('First issue created field:', response.data.issues[0].fields.created);
                console.log('First issue updated field:', response.data.issues[0].fields.updated);
              }
            }
            
            startAt += maxResults;
            
            // Stop if we've got all issues or if no more issues returned
            if (response.data.issues?.length === 0 || startAt >= totalIssues) {
              break;
            }
            
          } while (startAt < totalIssues);
          
          console.log(`Total issues fetched: ${allIssues.length}`);

          return allIssues.map((issue: any) => ({
            id: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            priority: issue.fields.priority?.name,
            storyPoints: issue.fields.customfield_10004 || issue.fields.customfield_10002,
            assignee: issue.fields.assignee?.displayName,
            lastUpdated: issue.fields.updated,
            created: issue.fields.created,
            issuetype: issue.fields.issuetype?.name,
          }));
        } catch (error) {
          lastError = error;
          console.log(`Failed with ${apiPath}:`, error instanceof Error ? error.message : error);
          continue; // Try next API version
        }
      }
      
      // If all versions failed, throw the last error
      throw lastError;
      
    } catch (error) {
      console.error('Error fetching Jira tickets:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Unknown error';
        throw new Error(`Failed to fetch Jira tickets: ${errorMessage}`);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch Jira tickets: ${errorMessage}`);
    }
  }

  async getTicketDetails(ticketId: string): Promise<JiraTicket | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/issue/${ticketId}`,
        {
          params: {
            fields: 'summary,status,priority,customfield_10004,assignee,updated,created,description',
          },
          headers: {
            ...this.getAuthHeader(),
            'Accept': 'application/json',
          },
        }
      );

      const issue = response.data;
      return {
        id: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name,
        storyPoints: issue.fields.customfield_10004,
        assignee: issue.fields.assignee?.displayName,
        lastUpdated: issue.fields.updated,
        created: issue.fields.created,
      };
    } catch (error) {
      console.error(`Error fetching ticket ${ticketId}:`, error);
      return null;
    }
  }

  async addComment(ticketId: string, comment: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/rest/api/3/issue/${ticketId}/comment`,
        {
          body: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: comment,
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      return true;
    } catch (error) {
      console.error(`Error adding comment to ticket ${ticketId}:`, error);
      return false;
    }
  }

  async getLatestTask(): Promise<JiraTicket | null> {
    try {
      const jql = 'assignee = currentUser() AND project = TNOQPAY ORDER BY updated DESC';
      const tickets = await this.getAssignedTickets(jql);
      return tickets.length > 0 ? tickets[0] : null;
    } catch (error) {
      console.error('Error fetching latest task:', error);
      return null;
    }
  }

  async logWork(ticketId: string, timeSpent: string, comment?: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/rest/api/3/issue/${ticketId}/worklog`,
        {
          timeSpent,
          comment: comment || 'Time logged via Productivity Dashboard',
        },
        {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      return true;
    } catch (error) {
      console.error(`Error logging work for ticket ${ticketId}:`, error);
      return false;
    }
  }

  async getAutomationTestCases(): Promise<JiraTicket[]> {
    try {
      // JQL to find test cases where user is automation engineer and status is automation backlog
      const jql = 'issuetype = "Test Case" AND status = "Automation Backlog" AND "Automation Engineer" = currentUser() ORDER BY created DESC';
      console.log('Fetching automation test cases with JQL:', jql);
      
      const tickets = await this.getAssignedTickets(jql);
      console.log(`Found ${tickets.length} automation test cases`);
      
      return tickets;
    } catch (error) {
      console.error('Error fetching automation test cases:', error);
      return [];
    }
  }
}

export const jiraService = new JiraService();
