import React from 'react';
import { DealMemo as DealMemoType } from '../../types';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../common/Button';
import { FileSignatureIcon } from '../icons/FileSignatureIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

interface DealMemoProps {
  memo: DealMemoType;
  onApprove: (memoId: string) => void;
  onInitiateSafePay: (memoId: string) => void;
}

export const DealMemo: React.FC<DealMemoProps> = ({ memo, onApprove, onInitiateSafePay }) => {
    const { currentUser } = useUser();
    
    if (!currentUser) return null;

    const hasApproved = memo.approver_ids.includes(currentUser.id);
    const isApproved = memo.status === 'approved';
    const isBuyer = currentUser.role === 'retailer';

    const renderStatus = () => {
        if (isApproved) {
            return <p className="text-sm font-bold text-green-400 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> تمت موافقة الطرفين</p>;
        }
        if (hasApproved) {
            return <p className="text-sm font-bold text-yellow-400">بانتظار موافقة الطرف الآخر...</p>;
        }
        return <p className="text-sm font-bold text-gray-400">بانتظار الموافقة</p>;
    };

  return (
    <div className="flex justify-center my-4">
      <div className="bg-brand-secondary rounded-lg w-full max-w-lg p-4 border-2 border-brand-accent/50 shadow-lg">
        <div className="flex items-center gap-3 border-b border-gray-600 pb-3 mb-3">
            <FileSignatureIcon className="w-8 h-8 text-brand-accent"/>
            <div>
                <h3 className="text-lg font-bold text-white">مذكرة اتفاق</h3>
                <p className="text-xs text-brand-text-secondary">تم إنشاؤها بواسطة المساعد الذكي</p>
            </div>
        </div>
        <table className="w-full text-sm my-4">
            <tbody>
                <tr className="border-b border-gray-700/50"><td className="py-1.5 font-semibold text-brand-text-secondary">المنتج:</td><td className="py-1.5 text-white font-bold">{memo.product}</td></tr>
                <tr className="border-b border-gray-700/50"><td className="py-1.5 font-semibold text-brand-text-secondary">الكمية:</td><td className="py-1.5 text-white font-bold">{memo.quantity}</td></tr>
                <tr className="border-b border-gray-700/50"><td className="py-1.5 font-semibold text-brand-text-secondary">السعر:</td><td className="py-1.5 text-white font-bold">{memo.price}</td></tr>
                <tr><td className="pt-1.5 font-semibold text-brand-text-secondary align-top">الشروط:</td><td className="pt-1.5 text-white font-bold">{memo.terms}</td></tr>
            </tbody>
        </table>

        <div className="border-t border-gray-600 pt-3 mt-3 flex justify-between items-center">
            {renderStatus()}
            {!hasApproved && !isApproved && (
                 <Button onClick={() => onApprove(memo.id)} className="!py-1.5 !px-4">
                    موافقة على الاتفاق
                 </Button>
            )}
        </div>
        
        {isApproved && isBuyer && (
            <div className="mt-4 pt-4 border-t border-gray-600">
                <Button onClick={() => onInitiateSafePay(memo.id)} className="w-full !bg-green-600 hover:!bg-green-700 flex items-center justify-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    تأمين الصفقة عبر الضمان الذكي
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};