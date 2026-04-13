import { Injectable, BadRequestException } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import { loadFaceApiModels } from './face-api-loader';
import { Firestore } from '@google-cloud/firestore';
import { Person } from '../interfaces/interfaces'
import { errorResponse, uploadImageToCloudStorage } from 'src/tools/function.tools';
import { firebaseStorage } from '../firebase/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Storage } from '@google-cloud/storage';
// Extraer las clases necesarias de canvas
const { Canvas, Image, ImageData } = canvas;
// Configurar face-api para usar canvas en Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData }as any);

@Injectable()
export class RecognitionService {
  private firestore: Firestore;
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.firestore = new Firestore();
    loadFaceApiModels(); // Cargar los modelos de Face API al iniciar el servicio
    this.storage = new Storage({
      projectId: 'let-s-help-433a1', // Reemplaza con el ID de tu proyecto
      keyFilename: 'let-s-help-433a1-eaa337cd6205.json', // Ruta al archivo de credenciales
    });
  this.bucketName = 'bucket-let-s-help'; // Nombre del bucket
  }

  // Decodificar imagen Base64 a un objeto Canvas
  private async decodeImage(imageBase64: string): Promise<faceapi.TNetInput> {
    const base64Data = imageBase64.split(',')[1]; // Elimina el prefijo base64
    const buffer = Buffer.from(base64Data, 'base64'); // Convierte base64 a buffer
    const img = await canvas.loadImage(buffer); // Carga la imagen usando canvas
    return img as unknown as faceapi.TNetInput; // Asegura que sea del tipo TNetInput
  }

  // Método para registrar una persona con su descriptor facial
  /* async registerPerson(data: any): Promise<string> {
    try {
      const { name, lastName, email,  documentType, documentNumber, birthdate, address, 
        neighborhood, policyNumber, emergencyContact, imageBase64   } = data;

      if (!imageBase64) {
        throw await errorResponse("Error: The base64 image is required for registration.", "registerPerson");
      }

      const img = await this.decodeImage(imageBase64);

      // Generar descriptor facial (vector único para el rostro)
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw await errorResponse("Error: No face was detected in the image provided.", "registerPerson");
      }

      const descriptor = Array.from(detection.descriptor); // Convertir Float32Array a un array normal

      // Guardar los datos en Firestore
      const personRef = this.firestore.collection('faceRecognition').doc();
      await personRef.set({
        name, lastName, email,
        documentType, documentNumber, birthdate, 
        address, neighborhood, policyNumber, imageBase64,
        emergencyContact, descriptor, createdAt: new Date().toISOString(),
      });

      return `Persona registrada exitosamente con ID: ${personRef.id}`;
    } catch (error) {
      console.error("Error al detectar el rostro del integrante:", error);
      throw error;
    }
    
  } */

  async registerPerson(data: any): Promise<string> {
    try {
        const { 
            name, lastName, email, documentType, documentNumber, birthdate, 
            address, neighborhood, policyNumber, emergencyContact, imageBase64 
        } = data;

        // Verificar que la imagen en Base64 esté presente
        if (!imageBase64) {
            throw await errorResponse("Error: The base64 image is required for registration.", "registerPerson");
        }

        // Decodificar la imagen Base64
        const img = await this.decodeImage(imageBase64);

        // Generar descriptor facial (vector único para el rostro)
        const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            throw await errorResponse("Error: No face was detected in the image provided.", "registerPerson");
        }

        const descriptor = Array.from(detection.descriptor); // Convertir Float32Array a un array normal

        // Subir la imagen a Cloud Storage
        const imageUrl = await uploadImageToCloudStorage(imageBase64, `images/${documentNumber}-${Date.now()}.jpg`);

        // Guardar los datos en Firestore
        const personRef = this.firestore.collection('faceRecognition').doc();
        await personRef.set({
            name, lastName, email,
            documentType, documentNumber, birthdate, 
            address, neighborhood, policyNumber, 
            emergencyContact, imageUrl, descriptor, createdAt: new Date().toISOString(),
        });

        return `Persona registrada exitosamente con ID: ${personRef.id}`;
    } catch (error) {
        console.error("Error al registrar la persona:", error);
        throw error;
    }
  }
  
  // Método para subir la imagen a Cloud Storage
  /* async uploadImageToCloudStorage(base64String: string, filePath: string): Promise<string> {
    try {
        // Decodifica la imagen Base64
        const buffer = Buffer.from(base64String, 'base64');

        // Obtén una referencia al archivo en el bucket
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(filePath);

        // Sube el archivo
        await file.save(buffer, {
            metadata: {
                contentType: 'image/jpg', // Cambia según el formato de tu imagen
            },
        });

        // Obtén una URL pública (si las reglas lo permiten)
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
        return publicUrl;
    } catch (error) {
        console.error("Error al subir la imagen a Google Cloud Storage:", error);
        throw new Error("Error al subir la imagen.");
    }
} */
  
  // Método para identificar una persona
  async identifyPerson(imageBase64: string): Promise<any> {
    try {
      if (!imageBase64) {
        throw await errorResponse(
          "Error: You must provide an image in base64 format for identification.",
          "identifyPerson"
        );
      }
  
      // Decodificar la imagen en base64
      const img = await this.decodeImage(imageBase64);
  
      // Generar descriptor facial para la imagen proporcionada
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
  
      if (!detection) {
        throw await errorResponse(
          "Error: No face was detected in the image provided.",
          "identifyPerson"
        );
      }
  
      const queryDescriptor = detection.descriptor;
  
      // Recuperar todas las personas registradas desde Firestore
      const peopleSnapshot = await this.firestore.collection('faceRecognition').get();
      const people = peopleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Omit<Person, 'id'>,
      }));
  
      console.log('People data:', people);
  
      if (people.length === 0) {
        throw await errorResponse("Error: There are no people registered to make the comparison.", "identifyPerson");
      }
  
      // Crear labeledDescriptors para FaceMatcher
      const labeledDescriptors = people.map((person) => {
        if (!person.descriptor) {
          console.warn(`La persona ${person.name} ${person.lastName} no tiene un descriptor válido.`);
          return null;
        }
  
        return new faceapi.LabeledFaceDescriptors(
          `${person.name} ${person.lastName}`,
          [new Float32Array(person.descriptor)]
        );
      }).filter(Boolean); // Filtrar cualquier valor nulo
  
      console.log('Labeled Descriptors:', labeledDescriptors);
  
      // Verificar si hay labeledDescriptors válidos
      if (labeledDescriptors.length === 0) {
        throw await errorResponse("Error: There are no valid descriptors to perform the comparison.", "identifyPerson");
      }
  
      // Crear el faceMatcher con el umbral deseado
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.4); // 0.4 para aproximadamente 90% de similitud
      const bestMatch = faceMatcher.findBestMatch(queryDescriptor);
  
      console.log('Best match label:', bestMatch);
  
      if (bestMatch.label === 'unknown') {
        throw await errorResponse("Error: No match found.", "identifyPerson");
      }
  
      // Encontrar los datos de la persona identificada
      const identifiedPerson = people.find(
        (p) => `${p.name} ${p.lastName}` === bestMatch.label
      );
  
      if (!identifiedPerson) {
        throw await errorResponse("Error: An error occurred while retrieving the data of the identified person.", "identifyPerson");
      }
  
      console.log('Persona identificada:', identifiedPerson);
  
      return {
        message: 'Persona identificada.',
        data: identifiedPerson,
      };
    } catch (error) {
      console.error('Error al identificar a la persona:', error);
      throw error;
    }
  }

  /**
   * Busca registros en la colección "faceRecognition" que coincidan con un nombre o parte de un nombre.
   * @param searchTerm Término de búsqueda (nombre o parte del nombre).
   * @returns Lista de registros coincidentes con los campos id, name, lastName y documentNumber.
   */
  async searchByName(searchTerm: string): Promise<any[]> {

    try {
      if (!searchTerm) {
        throw await errorResponse("Error: You must provide a search term.", "searchByName");
      }
      // Referencia a la colección "faceRecognition"
      const collectionRef = this.firestore.collection('faceRecognition');

      // Realizar la consulta
      const snapshot = await collectionRef
        .where('name', '>=', searchTerm) // Comienza con el término de búsqueda
        .where('name', '<=', searchTerm + '\uf8ff') // Termina con el término de búsqueda
        .get();

      if (snapshot.empty) {
        console.log('No se encontraron coincidencias.');
        return [];
      }

      // Extraer solo los campos necesarios
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          lastName: data.lastName,
          documentNumber: data.documentNumber,
        };
      });

      return results;
    } catch (error) {
      console.error('Error al buscar por nombre:', error);
      throw error;
    }
  }
  
}
