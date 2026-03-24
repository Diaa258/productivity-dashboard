'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Search, RefreshCw, ExternalLink, Clock, User, Paperclip } from 'lucide-react';

interface Email {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  body: {
    contentType: string;
    content: string;
  };
  isRead: boolean;
  hasAttachments: boolean;
}

export default function OutlookEmailWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/outlook/emails');
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.data);
        setIsAuthenticated(true);
      } else {
        if (data.error === 'authentication_required') {
          setIsAuthenticated(false);
        } else {
          setError(data.error || 'Failed to fetch emails');
        }
      }
    } catch (error) {
      setError('Failed to fetch emails');
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const authenticateOutlook = async () => {
    try {
      const response = await fetch('/api/outlook/auth');
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError('Failed to initiate authentication');
      }
    } catch (error) {
      setError('Failed to initiate authentication');
      console.error('Error initiating auth:', error);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const response = await fetch(`/api/outlook/emails/${emailId}/read`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setEmails(prev => prev.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        ));
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.emailAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.emailAddress.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Outlook Emails
        </CardTitle>
        <CardDescription>
          Recent emails from your Outlook account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Authentication Button */}
          {!isAuthenticated && (
            <div className="text-center py-4">
              <Button onClick={authenticateOutlook} className="w-full">
                Connect to Outlook
              </Button>
            </div>
          )}

          {/* Controls */}
          {isAuthenticated && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchEmails}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Email List */}
          {isAuthenticated && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEmails.slice(0, 10).map((email) => (
                <div
                  key={email.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    email.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  } hover:bg-gray-100`}
                  onClick={() => {
                    setSelectedEmail(email);
                    if (!email.isRead) {
                      markAsRead(email.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm font-medium ${email.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {email.from.emailAddress.name}
                        </span>
                        {!email.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                      <div className={`text-sm ${email.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'} mb-1 truncate`}>
                        {email.subject}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(email.receivedDateTime)}
                        {email.hasAttachments && (
                          <Paperclip className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Emails */}
          {isAuthenticated && filteredEmails.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No emails found matching your search' : 'No emails found'}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8 text-gray-500">
              Loading emails...
            </div>
          )}

          {/* Email Detail Modal */}
          {selectedEmail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEmail(null)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{selectedEmail.from.emailAddress.name}</span>
                    <span>&lt;{selectedEmail.from.emailAddress.address}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedEmail.receivedDateTime).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-96">
                  <div className="prose max-w-none">
                    {selectedEmail.body.contentType === 'text/html' ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedEmail.body.content }} />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {selectedEmail.body.content}
                      </pre>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://outlook.office.com/mail/0/inbox/item/${selectedEmail.id}`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Outlook
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show more indicator */}
          {isAuthenticated && filteredEmails.length > 10 && (
            <div className="text-sm text-gray-600 text-center">
              Showing 10 of {filteredEmails.length} emails
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
