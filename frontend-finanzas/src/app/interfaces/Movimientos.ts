export interface Movimiento {
    id: number;
    descripcion: string;
    importe: number;
    fecha: string;
    tipo_de_movimiento: string; // Nombre de la categoría
    categoria_id: number;
    usuario_id: number;
}

export interface Nuevomovimiento {
    id: null;
    descripcion: string;
    importe: number;
    fecha: string;
    categoria_id: number;
    usuario_id: number;
}
