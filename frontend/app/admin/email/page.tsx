'use client';

import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Plus, Search } from 'lucide-react';
import { EmailList } from './EmailList';
import { EmailDetail } from './EmailDetail';
import {ComposeEmail } from './ComposeEmail';  
import { i } from 'framer-motion/client';
import AdminShell from '../components/AdminShell';

// Định nghĩa kiểu dữ liệu cho Email
export type EmailType = {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  isRead: boolean;
  isImportant: boolean;
  label?: string;
};

// Dữ liệu mẫu ban đầu
const initialEmails: EmailType[] = [
  // ... (giữ nguyên dữ liệu mẫu từ code gốc)
  {
    id: '1',
    sender: 'Wise Team',
    senderEmail: 'hello@wise.com',
    subject: 'Your Wise account statement',
    preview: 'Here is your monthly account statement...',
    content: 'Dear customer,\n\nHere is your monthly account statement. Your ending balance is $2,450.00.\n\nThank you for using Wise!',
    date: '2024-03-15T10:30:00',
    isRead: false,
    isImportant: true,
    label: 'Financial'
  },
  {
    id: '2',
    sender: 'Search Console',
    senderEmail: 'noreply@google.com',
    subject: 'New search queries for your website',
    preview: 'Your website has appeared for 15 new search queries...',
    content: 'Your website has appeared for 15 new search queries in the last 7 days. View your Search Console report for more details.',
    date: '2024-03-14T08:15:00',
    isRead: false,
    isImportant: false,
    label: 'SEO'
  },
  {
    id: '3',
    sender: 'PayPal',
    senderEmail: 'service@paypal.com',
    subject: 'Your invoice from Shopify Store',
    preview: 'You have received a payment of $89.00...',
    content: 'You have received a payment of $89.00 USD from Shopify Store. The funds have been added to your PayPal balance.',
    date: '2024-03-10T14:45:00',
    isRead: true,
    isImportant: true,
    label: 'Payment'
  },
  {
    id: '4',
    sender: 'Google Meet',
    senderEmail: 'meet@google.com',
    subject: 'Meeting scheduled: Product Review',
    preview: 'Join the meeting with the product team...',
    content: 'You have a meeting scheduled with the product team. Click the link to join: https://meet.google.com/xxx',
    date: '2024-03-05T09:00:00',
    isRead: true,
    isImportant: false,
    label: 'Meeting'
  },
  {
    id: '5',
    sender: 'Loom',
    senderEmail: 'team@loom.com',
    subject: 'Your video is ready',
    preview: 'Your screen recording has been processed...',
    content: 'Your screen recording "Demo - New Feature" has been processed and is ready to view. Click here to watch it.',
    date: '2024-03-01T11:20:00',
    isRead: true,
    isImportant: false,
    label: 'Product'
  }
];

export default function EmailAdminPage() {
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const storedEmails = localStorage.getItem('admin_emails');
    if (storedEmails) {
      setEmails(JSON.parse(storedEmails));
    } else {
      setEmails(initialEmails);
      localStorage.setItem('admin_emails', JSON.stringify(initialEmails));
    }
  }, []);

  // Lưu dữ liệu vào localStorage mỗi khi emails thay đổi
  useEffect(() => {
    if (emails.length > 0) {
      localStorage.setItem('admin_emails', JSON.stringify(emails));
    }
  }, [emails]);

  // Lọc emails theo từ khóa tìm kiếm
  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmailSelect = (email: EmailType) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      setEmails(prev =>
        prev.map(e => e.id === email.id ? { ...e, isRead: true } : e)
      );
    }
  };

  const handleDeleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleToggleImportant = (id: string) => {
    setEmails(prev =>
      prev.map(e => e.id === id ? { ...e, isImportant: !e.isImportant } : e)
    );
  };

  const handleSendEmail = (newEmail: Omit<EmailType, 'id' | 'date' | 'isRead' | 'isImportant'>) => {
    const email: EmailType = {
      ...newEmail,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      isRead: false,
      isImportant: false,
    };
    setEmails(prev => [email, ...prev]);
    setIsComposeOpen(false);
  };

  const handleRefresh = () => {
    setEmails(initialEmails);
    localStorage.setItem('admin_emails', JSON.stringify(initialEmails));
    setSelectedEmail(null);
  };

  return (
    <AdminShell>
  <div className="h-full flex flex-col gap-4">

    {/* Header */}
    <div className="bg-white border border-gray-200 px-6 py-4 flex justify-between items-center rounded-xl shadow-sm">
      <div className="flex items-center space-x-4">
        <Mail className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Email Inbox</h1>

        <div className="relative ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <button
        onClick={() => setIsComposeOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <Plus className="h-4 w-4" />
        <span>Soạn email</span>
      </button>
    </div>

    {/* Main */}
    <div className="flex-1 flex gap-4  rounded-xl overflow-hidden">

      {/* Left - List */}
      <div className="w-96 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <EmailList
          emails={filteredEmails}
          selectedEmailId={selectedEmail?.id || null}
          onSelectEmail={handleEmailSelect}
          onDeleteEmail={handleDeleteEmail}
          onToggleImportant={handleToggleImportant}
        />
      </div>

      {/* Right - Detail */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <EmailDetail email={selectedEmail} />
      </div>
    </div>

    {/* Modal */}
    <ComposeEmail
      isOpen={isComposeOpen}
      onClose={() => setIsComposeOpen(false)}
      onSend={handleSendEmail}
    />
  </div>
</AdminShell>
  );
}