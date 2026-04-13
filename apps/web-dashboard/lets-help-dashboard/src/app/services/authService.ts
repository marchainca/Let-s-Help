import {LoginResponse} from "../interfaces/interfaces";
import CryptoJS from 'crypto-js'; 

  
/**
 * Función que realiza la llamada al backend para hacer login
 * @param email - Correo electrónico ingresado por el usuario
 * @param password - Contraseña ingresada por el usuario
 * @returns Objeto con la respuesta del servidor (token y datos de usuario)
 */
export async function loginRequest(
email: string,
password: string
): Promise<LoginResponse> {
    try {
        const hashPassword = CryptoJS.SHA256(password).toString();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: hashPassword }),
        });

        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }

        const data: LoginResponse = await response.json();
        return data;
    } catch (error: any) {
        console.log("Error en loginRequest: ", error.message || 'Error al realizar login' )
        throw new Error(error.message || 'Error al realizar login');
    }
}
  