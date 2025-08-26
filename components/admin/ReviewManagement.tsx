import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Rating } from '../Rating';
import { TrashIcon } from '../icons/TrashIcon';

export const ReviewManagement: React.FC = () => {
    const { reviews, users, deleteReview } = useAdmin();

    const handleDelete = (reviewId: string) => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'حذف التقييم',
                message: 'هل أنت متأكد من حذف هذا التقييم؟',
                onConfirm: () => deleteReview(reviewId),
            }
        }));
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">إدارة التقييمات والمراجعات</h2>
            <div className="bg-brand-secondary rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-brand-text uppercase bg-brand-primary/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">التقييم</th>
                            <th scope="col" className="px-6 py-3">المُقيِّم</th>
                            <th scope="col" className="px-6 py-3">التاجر</th>
                            <th scope="col" className="px-6 py-3">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => {
                            const reviewer = users.find(u => u.id === review.reviewer_id);
                            const seller = users.find(u => u.id === review.seller_id);
                            return (
                                <tr key={review.id} className="border-b border-brand-primary/50 hover:bg-brand-primary/30">
                                    <td className="px-6 py-4">
                                        <Rating rating={review.rating} />
                                        <p className="mt-1 text-xs text-gray-300 max-w-xs truncate">{review.comment || "لا يوجد تعليق"}</p>
                                    </td>
                                    <td className="px-6 py-4">{reviewer?.name || "مستخدم محذوف"}</td>
                                    <td className="px-6 py-4">{seller?.name || "تاجر محذوف"}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                          onClick={() => handleDelete(review.id)}
                                          className="font-medium text-red-400 hover:text-red-300 p-2 rounded-full"
                                          title="حذف التقييم"
                                        >
                                           <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {reviews.length === 0 && <p className="text-center p-8">لا توجد تقييمات لعرضها.</p>}
            </div>
        </div>
    );
};
