import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../interfaces/ApiResponse';
import { Nuevousuario, loginUsuario } from '../../interfaces/Usuarios';
import { Api } from '../../services/api';
import Swal from 'sweetalert2';
import { take } from 'rxjs';//PARA CERRAR EL SUSCRIBE UNA VEZ RECIBE LOS DATOS
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  // Esta señal controlará si mostramos el registro o el login
  isRegister = signal(false); 

  mensajeAlerta: string = '';
  Fallido: boolean =false;
  Exitoso: boolean =false;
  cerrandoAlerta: boolean = false;

  nuevoUsuario: Nuevousuario = {
    nombre: '',
    email: '',
    password:''
  };

  UsuarioLogeado: loginUsuario ={
    nombre: '',
    password:''
  }

  constructor(private api: Api, private router:Router) { }

  toggleForm(status: boolean) {
    this.isRegister.set(status);
  }

   registrarNuevoUsuario(){
    // Si algún campo está vacío...
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password) {
        this.mostrarFeedback(false, '¡Ey! Rellena todos los campos');
        return; // Esto actúa como un freno de mano. Detiene la función aquí y no llama al backend.
    }
      // 1. Llamamos al servicio y le pasamos el objeto que tiene los datos del formulario
      this.api.insertarUsuario(this.nuevoUsuario).pipe(take(1)).subscribe({
        //si todo va bien
        next: (respuesta: ApiResponse) => {
          // 2. Comprobamos qué nos ha dicho el PHP
          if (respuesta.resultado === 'OK' && respuesta.token) {
            sessionStorage.setItem('token', respuesta.token);
            sessionStorage.setItem('nombre_usuario', respuesta.usuario?.nombre || 'Usuario'); 
            setTimeout(() => {
                this.router.navigate(['/dashboard']);
            }, 2000); // 2000 milisegundos = 2 segundos

            this.mostrarFeedback(true,'¡Usuario insertado con éxito!');
          } else {
            this.mostrarFeedback(false, '¡Vaya, ya existe un usuario con ese email! 🚨');
          }
        },
        //si hay error
        error: (err) => {
          this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
          console.error(err);
        }
      });
    }


    logearUsuario(){
    // Si algún campo está vacío...
    if (!this.UsuarioLogeado.nombre || !this.UsuarioLogeado.password) {
        this.mostrarFeedback(false, '¡Ey! Rellena todos los campos');
        return; // Esto actúa como un freno de mano. Detiene la función aquí y no llama al backend.
    }
      // 1. Llamamos al servicio y le pasamos el objeto que tiene los datos del formulario
      this.api.logearUsuario(this.UsuarioLogeado).pipe(take(1)).subscribe({
        //si todo va bien
        next: (respuesta: ApiResponse) => {
          // 2. Comprobamos qué nos ha dicho el PHP
          if (respuesta.resultado === 'OK' && respuesta.token) {
           sessionStorage.setItem('token', respuesta.token);
           sessionStorage.setItem('nombre_usuario', respuesta.nombre || 'Usuario'); // <-- Guardamos el nombre aparte
            setTimeout(() => {
                this.router.navigate(['/dashboard']);
            }, 2000); // 2000 milisegundos = 2 segundos

            this.mostrarFeedback(true,'¡Usuario logeado con éxito!');
          } else {
            this.mostrarFeedback(false, '¡Vaya, no se ha podido iniciar sesión 🚨');
          }
        },
        //si hay error
        error: (err) => {
          this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
          console.error(err);
        }
      });
    }


    
  private mostrarFeedback(esExitoso: boolean, texto: string){
    this.mensajeAlerta = texto;
    if (esExitoso){
      this.Exitoso = true;
    } else {
      this.Fallido = true;
    }

    setTimeout(() => {
    this.cerrandoAlerta = true; // activa animación de salida

      // Esperar a que termine la animación
      setTimeout(() => {
        this.limpiarEstadosAlerta();
      }, 500); 
    }, 5000); 

  }


  private limpiarEstadosAlerta() {
    this.Exitoso = false;
    this.Fallido = false;
    this.cerrandoAlerta = false;
  }

     private resetForm() {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      password: ''
    };
  }

}
