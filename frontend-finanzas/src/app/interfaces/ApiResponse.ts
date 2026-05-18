export interface ApiResponse {
    resultado: string;
    error?: string;
    mensaje?: string;
    token?: string;
    nombre?: string;
    usuario?: {
        id: number;
        email: string;
        nombre: string;
    };
    
}
