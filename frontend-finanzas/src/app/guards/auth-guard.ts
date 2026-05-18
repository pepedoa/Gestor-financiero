import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {
  const token = sessionStorage.getItem('token'); 
  const router = inject(Router);

  if (token) {
    try {
      // 1. Obtener la segunda parte del token (el payload de datos)
      const payloadBase64 = token.split('.')[1]; 
      
      // 2. Descodificar de base64 a texto y convertirlo a un objeto JSON
      const payloadObjeto = JSON.parse(atob(payloadBase64));
      
      // 3. Conseguir el tiempo actual en segundos
      const tiempoActual = Math.floor(Date.now() / 1000); 

      // 4. Comprobar la fecha de caducidad La primera sirve para protegerte de posibles errores si el token no tuviera el formato correcto, y la segunda sirve para hacer el cálculo matemático de la caducidad.
      if (payloadObjeto.exp && payloadObjeto.exp < tiempoActual) {
        // ¡El token está caducado! 🚨
        sessionStorage.removeItem('token'); // Borramos el rastro antiguo
        router.navigate(['/login']); // Lo echamos al login
        return false;
      }

      // Si todo va bien, y no ha caducado...
      return true;

    } catch (e) {
      // Si el token está mal escrito o manipulado, fallará al descodificar.
      // Por seguridad también lo echamos fuera.
      sessionStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }

  } else {
    // Si directamente no hay token
    router.navigate(['/login']);
    return false;
  }
};

