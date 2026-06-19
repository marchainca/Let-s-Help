import { Injectable, BadRequestException } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import { loadFaceApiModels } from './face-api-loader';
import { Firestore } from '@google-cloud/firestore';
import { errorResponse, saveImageLocally } from 'src/tools/function.tools';
import { Storage } from '@google-cloud/storage';
import { DataBaseRecognitionService } from './data-base-recognition.service';
import { Beneficiary } from './entities/beneficiary.entity';
// Extraer las clases necesarias de canvas
const { Canvas, Image, ImageData } = canvas;
// Configurar face-api para usar canvas en Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData }as any);

@Injectable()
export class RecognitionService {
  private firestore: Firestore;
  private storage: Storage;
  private bucketName: string;

  constructor(
    private readonly dataBaseRecognitionService: DataBaseRecognitionService,
  ) {
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
            address, neighborhood, policyNumber, emergencyContact, imageBase64, city
        } = data;

        // Verificar que la imagen en Base64 esté presente
        if (!imageBase64) {
            throw await errorResponse("Error: The base64 image is required for registration.", "registerPerson");
        }

        // validar si el beneficiario ya existe en la base de datos relacional usando el número de documento
        const existingBeneficiary = await this.dataBaseRecognitionService.findBeneficiaryByIdentificationOrEmail(documentNumber, email);

        if (existingBeneficiary) {
          throw await errorResponse("Error: A beneficiary with the same identification or email already exists.", "registerPerson");
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

        // subir la imagen a la carpeta local usando la función saveImageLocally
        const fileName = `person_${documentNumber}_${Date.now()}.jpg`;
        const filePath = `images/${fileName}`;
        const imageUrl = await saveImageLocally(imageBase64, fileName);
        console.log("URL de la imagen guardada localmente:", imageUrl);

        //guardar los datos en PostgreSQL
        let docType = await this.dataBaseRecognitionService.getOrCreateDocumentType(documentType);

        let neighborhoodEntity = await this.dataBaseRecognitionService.findOrCreateNeighborhood(neighborhood, city);

        await this.dataBaseRecognitionService.createAddress(address, neighborhoodEntity);

        const beneficiaryData = new Beneficiary();
        beneficiaryData.FirstName = name;
        beneficiaryData.LastName = lastName;
        beneficiaryData.Email = email;
        beneficiaryData.Identification = documentNumber;
        beneficiaryData.Birthdate = new Date(birthdate);
        beneficiaryData.IdDocumentType = docType.IdDocumentType;
        beneficiaryData.PolicyNumber = policyNumber;
        beneficiaryData.EmergencyContact = emergencyContact;
        beneficiaryData.UrlImage = imageUrl;

        await this.dataBaseRecognitionService.createBeneficiary(beneficiaryData);

        await this.dataBaseRecognitionService.saveBiometricData(beneficiaryData.IdBeneficiary, descriptor);


        return `Persona registrada exitosamente con ID: ${documentNumber}`;
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

      // Recuperar todas las personas registradas desde la base de datos relacional junto con sus descriptores biométricos
      const beneficiaries = await this.dataBaseRecognitionService.getAllBeneficiariesWithBiometricData();
      //console.log("Beneficiarios obtenidos de la base de datos:", beneficiaries);
      if (beneficiaries.length === 0) {
        throw await errorResponse("Error: There are no people registered to make the comparison.", "identifyPerson");
      }

      // Construir arreglo de personas con sus descriptores (similar a la estructura de Firestore)
      const people = [];
    for (const beneficiary of beneficiaries) {
      // Obtener el descriptor más reciente (asumiendo que está ordenado por CreatedAt)
      const latestBiometric = beneficiary.biometricData?.sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime())[0];
      if (!latestBiometric || !latestBiometric.binaryDescriptor) {
        console.warn(`Beneficiario ${beneficiary.FirstName} ${beneficiary.LastName} no tiene descriptor biométrico válido.`);
        continue;
      }
      let descriptorArray: number[];
      try {
        const buffer = latestBiometric.binaryDescriptor;
        if (!buffer) {
          console.warn(`Beneficiario ${beneficiary.FirstName} ${beneficiary.LastName} no tiene descriptor biométrico válido.`);
          continue;
        }

        // Intentar parsear como JSON
        const jsonString = buffer.toString('utf8');
        if (jsonString.trim().startsWith('[')) {
          descriptorArray = JSON.parse(jsonString);
        } else {
          throw new Error('Not JSON');
        }
      } catch (err) {
        // Fallback: interpretar como Float32Array binario
        // Asegurar que el buffer sea el correcto
        const buffer = latestBiometric.binaryDescriptor;
        const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float32Array.BYTES_PER_ELEMENT);
        descriptorArray = Array.from(floatArray);
      }
      const documentTypeName = beneficiary.documentType?.Name
      people.push({
        id: beneficiary.IdBeneficiary.toString(),
        name: beneficiary.FirstName,
        lastName: beneficiary.LastName,
        email: beneficiary.Email,
        documentType: documentTypeName,
        documentNumber: beneficiary.Identification,
        birthdate: beneficiary.Birthdate ? beneficiary.Birthdate : '',
        address: beneficiary.address ? `${beneficiary.address.Street} ${beneficiary.address.Number||""}`: '',
        neighborhood: beneficiary.address?.neighborhood.NameNeighborhood || '',
        policyNumber: beneficiary.PolicyNumber,
        emergencyContact: beneficiary.EmergencyContact,
        imageUrl: beneficiary.UrlImage,
        descriptor: descriptorArray,
        createdAt: beneficiary.CreatedAt ? beneficiary.CreatedAt.toISOString() : '',
      });
    }

     if (people.length === 0) {
      throw await errorResponse("Error: There are no valid descriptors to perform the comparison.", "identifyPerson");
    }

    // Crear labeledDescriptors para FaceMatcher
    const labeledDescriptors = people.map((person) => {
      if (!person.descriptor) return null;
      return new faceapi.LabeledFaceDescriptors(
        `${person.name} ${person.lastName}`,
        [new Float32Array(person.descriptor)]
      );
    }).filter(Boolean);

    if (labeledDescriptors.length === 0) {
      throw await errorResponse("Error: There are no valid descriptors to perform the comparison.", "identifyPerson");
    }

    // Crear el faceMatcher
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.4);
    const bestMatch = faceMatcher.findBestMatch(queryDescriptor);

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

      const beneficiaries = await this.dataBaseRecognitionService.searchBeneficiariesByName(searchTerm);
      //console.log("Beneficiarios encontrados:", beneficiaries);
      const results = beneficiaries.map(b => ({
        id: b.IdBeneficiary.toString(),
        name: `${b.FirstName || ''} ${b.LastName || ''}`.trim(),
        lastName: b.LastName || '',
        documentNumber: b.Identification || '',
      }));
      return results;
    } catch (error) {
      console.error('Error al buscar por nombre:', error);
      throw error;
    }
  }

}
