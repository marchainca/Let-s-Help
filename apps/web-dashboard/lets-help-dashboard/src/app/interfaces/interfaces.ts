export interface LoginResponse {
    code: number;
    message: string;
    content: {
      accessToken: string;
      user: {
        id: string;
        idNumber: string;
        email: string;
        name: string;
        role: string;
        urlImage: string;
        birthdate: string;
      };
    };
}