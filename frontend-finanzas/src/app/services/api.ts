import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento, Nuevomovimiento} from '../interfaces/Movimientos';
import { ApiResponse } from '../interfaces/ApiResponse';
import { Categorias } from '../interfaces/Categorias';
import { Usuarios } from '../interfaces/Usuarios';


@Injectable({
  providedIn: 'root'
})
export class Api {

  //ruta a mi carpeta laragon donde tengo el backend
  private url = 'http://localhost/Proyecto-Finanzas/api-finanzas/';


  constructor(private http: HttpClient) { }

  //obtener gastos
  getMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.url + 'obtener_movimientod.php');
  }

  getCategorias(): Observable<Categorias[]> {
    return this.http.get<Categorias[]>(this.url + 'obtener_categorias.php');
  }

  getUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(this.url + 'obtener_usuarios.php');
  }

  insertarGasto(datos: Nuevomovimiento): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + 'guardar_gasto.php', datos);

  }

  eliminarMovimiento(id: number): Observable<any> {
    return this.http.post(this.url + 'borrar.php', {id});
  }

  actualizarGasto(datos: Nuevomovimiento): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + 'actualizar_gasto.php', datos);
  }


}
