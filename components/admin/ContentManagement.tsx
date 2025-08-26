
import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { TrashIcon } from '../icons/TrashIcon';

export const ContentManagement: React.FC = () => {
    const { categories, addCategory, deleteCategory, addSubcategory, deleteSubcategory, provinces, addProvince, deleteProvince } = useAdmin();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubcategory, setNewSubcategory] = useState<{ categoryId: string; name: string }>({ categoryId: '', name: '' });
    const [newProvinceName, setNewProvinceName] = useState('');

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">إدارة المحتوى الديناميكي</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Categories Management */}
                <div className="bg-brand-secondary p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-brand-accent">إدارة الفئات</h3>
                    <form onSubmit={(e) => { e.preventDefault(); addCategory(newCategoryName); setNewCategoryName(''); }} className="flex gap-2 mb-4">
                        <Input placeholder="اسم الفئة الرئيسية الجديدة" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                        <Button type="submit">إضافة</Button>
                    </form>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-brand-primary/50 p-3 rounded">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{cat.name}</span>
                                    <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                                <div className="pr-4 mt-2 space-y-1">
                                    {cat.subcategories.map(sub => (
                                        <div key={sub} className="flex justify-between items-center text-sm">
                                            <span>- {sub}</span>
                                            <button onClick={() => deleteSubcategory(cat.id, sub)} className="text-red-600 hover:text-red-500"><TrashIcon className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    <form onSubmit={(e) => { e.preventDefault(); addSubcategory(cat.id, newSubcategory.name); setNewSubcategory({ categoryId: '', name: '' }); }} className="flex gap-1 pt-1">
                                        <input type="text" placeholder="فئة فرعية جديدة..." onChange={(e) => setNewSubcategory({ categoryId: cat.id, name: e.target.value })} className="w-full bg-gray-700 text-xs p-1 rounded" />
                                        <button type="submit" className="text-xs bg-brand-accent text-brand-primary px-2 rounded">+</button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Provinces Management */}
                <div className="bg-brand-secondary p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-brand-accent">إدارة المحافظات</h3>
                    <form onSubmit={(e) => { e.preventDefault(); addProvince(newProvinceName); setNewProvinceName(''); }} className="flex gap-2 mb-4">
                        <Input placeholder="اسم المحافظة الجديدة" value={newProvinceName} onChange={(e) => setNewProvinceName(e.target.value)} />
                        <Button type="submit">إضافة</Button>
                    </form>
                     <div className="space-y-2 max-h-96 overflow-y-auto">
                        {provinces.map(prov => (
                             <div key={prov.id} className="bg-brand-primary/50 p-3 rounded flex justify-between items-center">
                                <span className="font-bold">{prov.name}</span>
                                <button onClick={() => deleteProvince(prov.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};