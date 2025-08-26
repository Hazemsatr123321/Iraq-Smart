import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TrashIcon } from '../icons/TrashIcon';
import { EditIcon } from '../icons/EditIcon';
import type { PaymentMethod } from '../../types';

type FormState = Omit<PaymentMethod, 'id' | 'created_at'>;

export const PaymentManagement: React.FC = () => {
    const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useAdmin();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [formState, setFormState] = useState<FormState>({
        name: '',
        type: '',
        details: {},
        is_active_for_features: false,
        is_active_for_donations: false,
    });
    const [detailsString, setDetailsString] = useState('{}');

    const handleOpenForm = (method: PaymentMethod | null) => {
        setEditingMethod(method);
        if (method) {
            setFormState(method);
            setDetailsString(JSON.stringify(method.details, null, 2));
        } else {
            setFormState({
                name: '',
                type: '',
                details: {},
                is_active_for_features: false,
                is_active_for_donations: false,
            });
            setDetailsString('{}');
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingMethod(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormState(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDetailsString(e.target.value);
        try {
            const parsed = JSON.parse(e.target.value);
            setFormState(prev => ({ ...prev, details: parsed }));
        } catch (error) {
            // Ignore parse errors while typing
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Final validation of JSON
            const details = JSON.parse(detailsString);
            const payload = { ...formState, details };

            if (editingMethod) {
                await updatePaymentMethod(editingMethod.id, payload);
            } else {
                await addPaymentMethod(payload);
            }
            handleCloseForm();
        } catch (error) {
            alert('Error saving payment method. Please ensure Details is valid JSON.');
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-brand-primary-light text-brand-text">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-brand-text">Payment Method Management</h2>
                <Button onClick={() => handleOpenForm(null)}>Add New Method</Button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-brand-secondary p-8 rounded-lg w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6">{editingMethod ? 'Edit' : 'Add'} Payment Method</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Name" name="name" value={formState.name} onChange={handleChange} required />
                            <Input label="Type" name="type" placeholder="e.g., mobile_wallet, bank_transfer" value={formState.type} onChange={handleChange} required />
                            <div>
                                <label className="block text-sm font-bold mb-2">Details (JSON)</label>
                                <textarea
                                    className="w-full bg-brand-primary p-2 rounded-md border border-gray-600"
                                    rows={4}
                                    value={detailsString}
                                    onChange={handleDetailsChange}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="is_active_for_features" checked={formState.is_active_for_features} onChange={handleChange} />
                                    Active for Features
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="is_active_for_donations" checked={formState.is_active_for_donations} onChange={handleChange} />
                                    Active for Donations
                                </label>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-brand-secondary rounded-lg shadow-md">
                <ul className="divide-y divide-gray-700">
                    {paymentMethods.map(method => (
                        <li key={method.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{method.name} <span className="text-sm text-gray-400">({method.type})</span></p>
                                <div className="text-xs text-gray-400 flex gap-4 mt-1">
                                    <span className={method.is_active_for_features ? 'text-green-400' : 'text-red-400'}>
                                        {method.is_active_for_features ? 'FEATURES_ACTIVE' : 'FEATURES_INACTIVE'}
                                    </span>
                                    <span className={method.is_active_for_donations ? 'text-green-400' : 'text-red-400'}>
                                        {method.is_active_for_donations ? 'DONATIONS_ACTIVE' : 'DONATIONS_INACTIVE'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="icon" onClick={() => handleOpenForm(method)}><EditIcon className="w-5 h-5" /></Button>
                                <Button variant="icon" className="text-red-500" onClick={() => deletePaymentMethod(method.id)}><TrashIcon className="w-5 h-5" /></Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
