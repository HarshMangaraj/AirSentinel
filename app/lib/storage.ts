import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export async function uploadReportImage(localUri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const fileExt = localUri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;

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