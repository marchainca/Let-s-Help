// translation/translation.service.ts
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import * as deepl from 'deepl-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranslationService implements OnModuleInit {
  private translator: deepl.Translator;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const authKey = this.configService.get<string>('DEEPL_AUTH_KEY');
    if (!authKey) {
      throw new Error('DeepL auth key is missing. Please set DEEPL_AUTH_KEY in .env');
    }
    this.translator = new deepl.Translator(authKey);
  }

  /**
   * Traduce un texto del idioma origen al destino.
   * @param text Texto a traducir (máx. 5000 caracteres por recomendación de DeepL).
   * @param targetLang Código de idioma destino (por defecto 'ES').
   * @param sourceLang Código de idioma origen (opcional, auto‑detección si no se proporciona).
   * @returns Texto traducido.
   */
  async translate(text: string, targetLang: deepl.TargetLanguageCode = 'es', sourceLang?: deepl.SourceLanguageCode,): Promise<string> {
    
    if (!text || text.trim().length === 0) {
      throw new Error('El texto a traducir no puede estar vacío');
    }

    try {
      const result = await this.translator.translateText(
        text,
        sourceLang || null,
        targetLang,
        {
          // Opcional: puedes añadir formateo, etiquetas HTML, etc.
          // preserveFormatting: true,
          // splitSentences: 'nonewlines',
        },
      );
      return result.text;
    } catch (error) {
      console.error(`Error al traducir texto: ${error.message}`);
      throw new Error(`Fallo en la traducción: ${error.message}`);
    }
  }

  /**
   * Traduce múltiples textos en una sola llamada (recomendado para lotes).
   * @param texts Array de textos a traducir.
   * @param targetLang Idioma destino.
   * @param sourceLang Idioma origen (opcional).
   * @returns Array con los textos traducidos.
   */
  async translateBatch(
    texts: string[],
    targetLang: deepl.TargetLanguageCode = 'es',
    sourceLang?: deepl.SourceLanguageCode,
  ): Promise<string[]> {
    if (!texts || texts.length === 0) {
      throw new Error('No se proporcionaron textos para traducir');
    }

    try {
      const results = await Promise.all(
        texts.map(text => this.translator.translateText(text, sourceLang || null, targetLang)),
      );
      return results.map(r => r.text);
    } catch (error) {
      console.error(`Error en traducción por lotes: ${error.message}`);
      throw new Error(`Fallo en la traducción por lotes: ${error.message}`);
    }
  }

  /**
   * Obtiene el uso actual del plan (solo para planes de pago).
   */
  async getUsage() {
    try {
      const usage = await this.translator.getUsage();
      return {
        characterCount: usage.character.count,
        characterLimit: usage.character.limit,
      };
    } catch (error) {
      console.error('No se pudo obtener el uso de la API');
      return null;
    }
  }
}