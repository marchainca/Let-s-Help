import { Injectable } from '@nestjs/common';
import { errorResponse, isBase64, saveImageLocally } from 'src/tools/function.tools';
import { UsersDataBaseService } from './users-data-base.service';

@Injectable()
export class UsersService {
    private collectionName = 'users';

    constructor(
        private readonly dataBaseService: UsersDataBaseService,
    ) {}

    private getImageExtension(base64String: string): string {
        const match = base64String.match(/^data:image\/(\w+);base64,/);
        if (!match) return 'jpg';
        return match[1].replace('jpeg', 'jpg');
    }

    private async saveProfileImage(base64Image: string, idNumber: string): Promise<string> {
        if (!(await isBase64(base64Image))) {
            throw await errorResponse('Error: profile image must be a valid base64 string.', 'createUser');
        }

        const extension = this.getImageExtension(base64Image);
        const fileName = `user_${idNumber}_${Date.now()}.${extension}`;
        return saveImageLocally(base64Image, `profiles/${fileName}`, 'uploads', true);
    }

    /**
     * Crear usuarios en Firestore
     * @param data Datos del usuario
     */
    async createUser(data: any, langId: number): Promise<object> {
        try {
            const userByEmail = await this.dataBaseService.getUserByEmail(data.email);
            console.log("Consulta de usuario por email:", userByEmail.length > 0 ? "Usuario encontrado" : "No se encontró usuario");

            if (userByEmail.length > 0 ) {
                throw await errorResponse(`Error: user is already registered with the email ${data.email}`, "createUser");
            }

            const userByIdNumber = await this.dataBaseService.getUserByIdNumber(data.idNumber,langId );
            console.log("Consulta de usuario por idNumber:", userByIdNumber.length > 0 ? "Usuario encontrado" : "No se encontró usuario");

            if (userByIdNumber.length > 0) {
                throw await errorResponse(`Error: user is already registered with the idNumber ${data.idNumber}`, "createUser");
            }

            if (data.urlImage) {
                data.urlImage = await this.saveProfileImage(data.urlImage, data.idNumber);
            }

            //data.password = await argon2.hash(data.password);

            const newUser = await this.dataBaseService.createUser(data);
            //console.log("Usuario creado en la base de datos:", newUser);
            return { id: newUser.Identification };
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    }


    // Obtener todos los usuarios
    async getUsers(): Promise<any[]> {
        try {
            const users = await this.dataBaseService.getUsers();

            // Mapear al formato requerido
            const formattedUsers = users.map(user => ({
                id: user.IdUser.toString(),  // Convertir número a string (simula ID de Firestore)
                email: user.Email,
                password: user.Password,
                idNumber: user.Identification,
                name: `${user.FirstName || ''} ${user.LastName || ''}`.trim(),
                //role: user.role?.NameRole,
                birthdate: user.Birthdate ? user.Birthdate : '',
                urlImage: user.UrlImage || '',
            }));
            return formattedUsers;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            throw error;

        }

    }

    // Actualizar un usuario por ID
    async updateUser(userId: string, data: any, langId: number): Promise<void> {
        /* if ( await isBase64(data.urlImage) ) {
            console.log("Entro al if del base64")
           data.urlImage= await uploadImageToCloudStorage(data.urlImage, `images/${data.idNumber}-${Date.now()}.jpg`)
        } */
        // Buscar el usuario por identificación
        const user  = await this.dataBaseService.getUserByIdNumber(userId, langId);
        
        if (!user || user.length === 0) {
            throw await errorResponse(`Usuario con ID ${userId} no encontrado`, 'updateUser');
        }
        // Actualizar nombre (dividir en FirstName y LastName)
        if (data.name !== undefined) {
            const nameParts = data.name.trim().split(' ');
            user[0].FirstName = nameParts[0];
            user[0].LastName = nameParts.slice(1).join(' ') || '';
        }

         // Actualizar email
        if (data.email !== undefined) {
            user[0].Email = data.email;
        }

        // Actualizar fecha de nacimiento (formato YYYY-MM-DD)
        if (data.birthdate !== undefined) {
            user[0].Birthdate = new Date(data.birthdate);
            // Validar que la fecha sea válida
            if (isNaN(user[0].Birthdate.getTime())) {
                throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
            }
        }

        // Actualizar imagen de perfil
        if (data.profileImage !== undefined) {
            user[0].UrlImage = data.profileImage;
        }

        // Actualizar contraseña (aplicar hash SHA‑256)
        if (data.password !== undefined) {
            user[0].Password = data.password
        }

        await this.dataBaseService.updateUser(user[0]);

    }

}
