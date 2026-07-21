import { HttpStatus } from "@nestjs/common";
import {CustomResponse} from '../interfaces/interfaces';
import { Storage } from '@google-cloud/storage';
import params from "./params";



/**
 * Función reutilizable para enviar respuestas HTTP
 * @param success Si la operación fue exitosa(true) o fallida(false)
 * @param message El mensaje a enviar en la respuesta
 * @param data Los datos a incluir en la respuesta
*/
export async function sendResponse(success: boolean, message: string, content?: any): Promise<CustomResponse> {
    const code = success ? 1 : 0;
    const response: CustomResponse = {
      code,
      message,
      content,
    };
    return response;
  }

export async function errorResponse(message: string, attribute: string): Promise<CustomResponse> {
  const response: CustomResponse = {
    code: params.ResponseCodes.ERROR,
    message: message,
    attribute: attribute,
    statusCode: HttpStatus.BAD_REQUEST,
  };
  return response;

}

//Método para validar si un string está codificado en base64
export function isBase64(value: string): boolean {
  if (!value) return false;
  const clean = value
      .replace(/^data:.*;base64,/, '')
      .replace(/\s/g, '');
  try {
      const buffer = Buffer.from(clean, 'base64');
      return buffer.toString('base64') === clean;
  } catch {
    return false;
  }
}

// Método para subir la imagen a Cloud Storage
export async function uploadImageToCloudStorage(base64String: string, filePath: string): Promise<string> {
  const  storage: Storage = new Storage({
    projectId: 'let-s-help-433a1', // Reemplaza con el ID de tu proyecto
    keyFilename: 'let-s-help-433a1-eaa337cd6205.json', // Ruta al archivo de credenciales
  });
  const bucketName: string = 'bucket-let-s-help';
  try {
      // Decodifica la imagen Base64
      const buffer = Buffer.from(base64String, 'base64');

      // Obtén una referencia al archivo en el bucket
      console.log("contenido de bucketName ", bucketName)
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(filePath);

      // Sube el archivo
      await file.save(buffer, {
          metadata: {
              contentType: 'image/jpg', // Cambia según el formato de tu imagen
          },
      });

      // Obtén una URL pública (si las reglas lo permiten)
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      return publicUrl;
  } catch (error) {
      console.error("Error al subir la imagen a Google Cloud Storage:", error);
      throw new Error("Error al subir la imagen.");
  }
}

/**
 * Método para formatear la fecha sin librerías
 * @param seconds Los segundos transcurridos para calcular la fecha
 */
export function formatDate(seconds: number) {
  const date = new Date(seconds * 1000); // paso a milisegundos para poderlo formatear
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const secondsFormatted = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${secondsFormatted}`;

}

// metodo para guardar la imagen en el servidor local en la ruta "uploads" y retornar la ruta del archivo guardado
export async function saveImageLocally(
  base64String: string,
  fileName: string,
  imagesFolder = process.env.IMAGES_FOLDER ?? 'uploads',
  returnPublicUrl = false,
): Promise<string> {

  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '..', '..', imagesFolder);
  const filePath = path.join(uploadsDir, fileName);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const cleanBase64 = base64String.replace(
    /^data:image\/\w+;base64,/,
    '',
  );
  const buffer = Buffer.from(cleanBase64, 'base64');
  fs.writeFileSync(filePath, buffer);

  if (returnPublicUrl) {
    return `/${path.join(imagesFolder, fileName).replace(/\\/g, '/')}`;
  }
  return filePath;
}