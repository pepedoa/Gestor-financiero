import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento, Nuevomovimiento} from '../interfaces/Movimientos';
import { ApiResponse } from '../interfaces/ApiResponse';
import { Categorias } from '../interfaces/Categorias';
import { Usuarios, Nuevousuario, loginUsuario } from '../interfaces/Usuarios';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class Api {

  //ruta a mi carpeta laragon donde tengo el backend
  private url = 'http://localhost/Proyecto-Finanzas/api-finanzas/';


  constructor(private http: HttpClient) { }

  //obtener gastos
  getMovimientos(): Observable<Movimiento[]> {
    const token = sessionStorage.getItem('token');
  // Creamos el cofre de cabeceras metiendo nuestro pase VIP
  const cabeceras = new HttpHeaders({
    'X-Token': token || '' 
  });

    return this.http.get<Movimiento[]>(this.url + 'obtener_movimientod.php', { headers: cabeceras });

  }

  getCategorias(): Observable<Categorias[]> {
    return this.http.get<Categorias[]>(this.url + 'obtener_categorias.php');
  }

  getUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(this.url + 'obtener_usuarios.php');
  }

  insertarGasto(datos: Nuevomovimiento): Observable<ApiResponse> {
    const token = sessionStorage.getItem('token');
    // Creamos el cofre de cabeceras metiendo nuestro pase VIP
    const cabeceras = new HttpHeaders({
      'X-Token': token || '' 
    });  

    return this.http.post<ApiResponse>(this.url + 'guardar_gasto.php', datos, { headers: cabeceras });

  }

  eliminarMovimiento(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const cabeceras = new HttpHeaders({
      'X-Token': token || '' 
    });  
    return this.http.post(this.url + 'borrar.php', {id}, { headers: cabeceras });
  }

    
  eliminarMovimientos(ids: number[]): Observable<any> {
    const token = sessionStorage.getItem('token');
    const cabeceras = new HttpHeaders({
      'X-Token': token || '' 
    });  
    return this.http.post(this.url + 'borrarMasivo.php', {ids}, { headers: cabeceras });
  }

  actualizarGasto(datos: Nuevomovimiento): Observable<ApiResponse> {
    const token = sessionStorage.getItem('token');
    // Creamos el cofre de cabeceras metiendo nuestro pase VIP
    const cabeceras = new HttpHeaders({
      'X-Token': token || '' 
    });  
    return this.http.post<ApiResponse>(this.url + 'actualizar_gasto.php', datos, { headers: cabeceras });
  }

  insertarUsuario(datos: Nuevousuario): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + 'registrar.php', datos);

  }

  logearUsuario(datos: loginUsuario): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + 'login.php', datos);

  }

}
