import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SIGNED_URL_TTL_SECONDS = 600;

@Injectable()
export class SupabaseStorageService {
  private client: SupabaseClient | null = null;
  private readonly bucket =
    process.env.SUPABASE_STORAGE_BUCKET ?? 'attachments';

  private getClient(): SupabaseClient {
    if (!this.client) {
      const url = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceKey) {
        throw new ServiceUnavailableException(
          'Armazenamento de anexos não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
        );
      }
      this.client = createClient(url, serviceKey, {
        auth: { persistSession: false },
      });
    }
    return this.client;
  }

  async upload(path: string, buffer: Buffer, mimeType?: string): Promise<void> {
    const { error } = await this.getClient()
      .storage.from(this.bucket)
      .upload(path, buffer, { contentType: mimeType, upsert: false });
    if (error) {
      throw new InternalServerErrorException(
        `Erro ao enviar arquivo: ${error.message}`,
      );
    }
  }

  async removeMany(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.getClient()
      .storage.from(this.bucket)
      .remove(paths);
    if (error) {
      throw new InternalServerErrorException(
        `Erro ao remover arquivo: ${error.message}`,
      );
    }
  }

  async createSignedUrl(path: string): Promise<string> {
    const { data, error } = await this.getClient()
      .storage.from(this.bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error || !data) {
      throw new InternalServerErrorException(
        `Erro ao gerar link de download: ${error?.message}`,
      );
    }
    return data.signedUrl;
  }
}
