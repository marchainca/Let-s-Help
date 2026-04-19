import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { FirebaseService } from 'src/firebase/firebase.service';
import { BeneficiaryService } from 'src/beneficiary/beneficiary.service';
import { errorResponse, isBase64, uploadImageToCloudStorage } from 'src/tools/function.tools';
import { DataBaseService } from './data-base.service';

@Injectable()
export class UsersService {
    private collectionName = 'users';
    
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly dataBaseService: DataBaseService,
    ) {}

    /**
     * Crear usuarios en Firestore
     * @param data Datos del usuario
     */
    async createUser(data: any): Promise<object> {
        try {
            const userByEmail = await this.dataBaseService.getUserByEmail(data.email);
            console.log("Consulta de usuario por email:", userByEmail.length > 0 ? "Usuario encontrado" : "No se encontró usuario");

            if (userByEmail.length > 0 ) {
                throw await errorResponse(`Error: user is already registered with the email ${data.email}`, "createUser");
            }

            const userByIdNumber = await this.dataBaseService.getUserByIdNumber(data.idNumber);
            console.log("Consulta de usuario por idNumber:", userByIdNumber.length > 0 ? "Usuario encontrado" : "No se encontró usuario");  

            if (userByIdNumber.length > 0) {
                throw await errorResponse(`Error: user is already registered with the idNumber ${data.idNumber}`, "createUser");
            }

            //data.password = await argon2.hash(data.password);
            
            const newUser = await this.dataBaseService.createUser(data);
            return { id: newUser[0].IdUser };
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    }


    // Obtener todos los usuarios
    async getUsers(): Promise<any[]> {
        // Llama al método genérico para obtener documentos de la colección
        return await this.firebaseService.getDocuments(this.collectionName);
    }

    // Actualizar un usuario por ID
    async updateUser(userId: string, data: any): Promise<void> {
        if ( await isBase64(data.urlImage) ) {
            console.log("Entro al if del base64")
           data.urlImage= await uploadImageToCloudStorage(data.urlImage, `images/${data.idNumber}-${Date.now()}.jpg`)
        } 
        // Llama al método genérico para actualizar un documento
        return await this.firebaseService.updateDocument(this.collectionName, userId, data);
    }

    // Eliminar un usuario por ID
    async deleteUser(userId: string): Promise<void> {
        // Llama al método genérico para eliminar un documento
        return await this.firebaseService.deleteDocument(this.collectionName, userId);
    }

}
