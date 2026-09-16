import { supabase } from './supabase';
import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export async function uploadReportImage(localUri: string): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id || 'anonymous';

    const file = new File(localUri);
    const base64 = await file.base64();

    const fileExt = localUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('reports')
      .upload(fileName, decode(base64), { contentType: `image/${fileExt}` });

    if (error) {
      console.log('Upload error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('reports').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.log('Upload exception:', e);
    return null;
  }
}