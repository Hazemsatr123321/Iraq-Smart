import React from 'react';
import { Button } from './Button';
import { WifiIcon } from '../icons/WifiIcon';
import { WifiOffIcon } from '../icons/WifiOffIcon';

export type ConnectionStatus = 'connecting' | 'online' | 'offline';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  onRetry: () => void;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ status, onRetry }) => {
  const statusConfig = {
    connecting: {
      text: 'جاري الاتصال بقاعدة البيانات...',
      icon: <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>,
      color: 'bg-yellow-600',
    },
    online: {
      text: 'متصل بقاعدة البيانات',
      icon: <WifiIcon className="w-5 h-5" />,
      color: 'bg-green-600',
    },
    offline: {
      text: 'غير متصل. يعمل التطبيق ببيانات وهمية.',
      icon: <WifiOffIcon className="w-5 h-5" />,
      color: 'bg-red-600',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className={`fixed bottom-20 md:bottom-4 right-20 md:right-4 z-[60] p-3 rounded-lg text-white shadow-lg text-sm flex items-center gap-3 animate-fadeInUp ${currentStatus.color}`}>
      {currentStatus.icon}
      <span>{currentStatus.text}</span>
      {status === 'offline' && (
        <Button onClick={onRetry} variant="secondary" className="!py-1 !px-3 !text-xs !bg-white/20 hover:!bg-white/40">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
};