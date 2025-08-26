import { supabase } from './supabaseClient';

const BUCKET_NAME = 'ads_images';

export const uploadAdImage = async (file: File, userId: string): Promise<string> => {
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('فشل رفع الصورة.');
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    if (!data.publicUrl) {
        throw new Error('فشل في الحصول على رابط الصورة بعد الرفع.');
    }

    return data.publicUrl;
};

export const deleteAdImage = async (imageUrl: string): Promise<void> => {
    try {
        const url = new URL(imageUrl);
        const filePath = url.pathname.split(`/${BUCKET_NAME}/`)[1];

        if (!filePath) {
            console.warn(`Could not extract file path from URL: ${imageUrl}`);
            return;
        }

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
            // We don't throw an error here, as failing to delete an orphan file
            // shouldn't block the user's main action (e.g., deleting an ad).
        }
    } catch (error) {
        console.error('Invalid URL for deletion:', error);
    }
};
