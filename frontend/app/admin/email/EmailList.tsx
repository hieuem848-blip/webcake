'use client';

import { EmailType } from '@/app/admin/email/page';
import { Star, Trash2, Mail as MailIcon, MailOpen } from 'lucide-react';

interface EmailListProps {
  emails: EmailType[];
  selectedEmailId: string | null;
  onSelectEmail: (email: EmailType) => void;
  onDeleteEmail: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

export function EmailList({ emails, selectedEmailId, onSelectEmail, onDeleteEmail, onToggleImportant }: EmailListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="divide-y divide-gray-100 overflow-y-auto h-full">
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <MailIcon className="h-12 w-12 mb-2" />
          <p>Không có email nào</p>
        </div>
      ) : (
        emails.map((email) => (
          <div
            key={email.id}
            className={`group p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedEmailId === email.id ? 'bg-blue-50' : ''
            } ${!email.isRead ? 'bg-blue-50/30' : ''}`}
            onClick={() => onSelectEmail(email)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {!email.isRead ? (
                    <MailIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                    {email.sender}
                  </span>
                  {email.label && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                      {email.label}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate mb-1 ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">{email.preview}</p>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(email.date)}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleImportant(email.id);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 ${
                      email.isImportant ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEmail(email.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}