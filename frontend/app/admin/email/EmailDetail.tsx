'use client';

import { EmailType } from '@/app/admin/email/page';
import { Star, Archive, Reply, MoreVertical, User, Calendar, AtSign, MailIcon, } from 'lucide-react';

interface EmailDetailProps {
  email: EmailType | null;
}

export function EmailDetail({ email }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white">
        <MailIcon className="h-16 w-16 mb-4" />
        <p className="text-lg">Chọn một email để xem nội dung</p>
        <p className="text-sm">Danh sách email ở bên trái</p>
      </div>
    );
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Email Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{email.subject}</h2>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Star className={`h-5 w-5 ${email.isImportant ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Archive className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sender Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-medium">
                {email.sender.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">{email.sender}</p>
                <p className="text-sm text-gray-500">({email.senderEmail})</p>
              </div>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Tới: Tôi</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatFullDate(email.date)}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Reply className="h-4 w-4" />
            <span>Trả lời</span>
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="px-8 py-6">
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {email.content}
          </p>
        </div>
      </div>
    </div>
  );
}