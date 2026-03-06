import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Movimiento, Nuevomovimiento } from '../../interfaces/Movimientos';
import { ApiResponse } from '../../interfaces/ApiResponse';
import { Categorias } from '../../interfaces/Categorias';
import { CommonModule } from '@angular/common';
import { Usuarios } from '../../interfaces/Usuarios';
import Swal from 'sweetalert2';
import { take } from 'rxjs';//PARA CERRAR EL SUSCRIBE UNA VEZ RECIBE LOS DATOS

@Component({
  selector: 'app-root',

  standalone: true,
  imports: [ FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  mensajeAlerta: string = '';
  Fallido: boolean =false;
  Exitoso: boolean =false;
  cerrandoAlerta: boolean = false;
  currentYear: number = new Date().getFullYear();

  totalIngresos: number = 0;
  totalGastos: number = 0;
  totalBalance: number = 0;

  misGastos: Movimiento[] = [];
  listaCategorias: Categorias[] = [];
  listaUsuarios: Usuarios[] = [];
  nuevoGasto: Nuevomovimiento = {
    id: null,
    descripcion: '',
    fecha: '',
    importe: 0,
    categoria_id: 0,
    usuario_id: 0
  };

  //inyección de dependencias
  constructor(private api: Api) { }

  ngOnInit() {
    this.cargarMovimientos();
    this.cargarCategorias();
    this.cargarUsuarios();
  }


  cargarMovimientos() {
    this.api.getMovimientos().pipe(take(1)).subscribe({
      next: (datos: Movimiento[]) => {
        this.misGastos = datos;
        this.actualizarTotales();
      },
      error: (err) => {
        console.error('Error al cargar movimientos', err);
      }
    });
  }

  cargarCategorias() {
    this.api.getCategorias().pipe(take(1)).subscribe({
      next: (datos: Categorias[]) => {
        this.listaCategorias = datos;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
      }
    });
  }

  cargarUsuarios() {
    this.api.getUsuarios().pipe(take(1)).subscribe({
      next: (datos: Usuarios[]) => {
        this.listaUsuarios = datos;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
      }
    });
  }


  guardar() {

    if(this.nuevoGasto.id){
       this.actualizarMovimiento();
    } else {
      this.registrarNuevoGasto();
    }
    
  }

  registrarNuevoGasto(){
    // 1. Llamamos al servicio y le pasamos el objeto que tiene los datos del formulario
    this.api.insertarGasto(this.nuevoGasto).pipe(take(1)).subscribe({
      //si todo va bien
      next: (respuesta: ApiResponse) => {
        // 2. Comprobamos qué nos ha dicho el PHP
        if (respuesta.resultado === 'OK') {
          this.resetForm();
          this.cargarMovimientos();
          this.mostrarFeedback(true,'¡Movimiento insertado con éxito!');
        } else {
          this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
        }
      },
      //si hay error
      error: (err) => {
        this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
        console.error(err);
      }
    });
  }

  prepararEdicion(item: any) {
    // 1. Buscamos el elemento que tiene la etiqueta #miFormulario
    const elemento = document.querySelector('#miFormulario');

    // 2. Si lo encuentra, hace scroll hasta allí
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });//El behavior: 'smooth' hace que la página no pegue un salto brusco, sino que se deslice suavemente
    }
    // 3. Los tres puntos "copian" el objeto para que no se mueva la tabla al escribir
      this.nuevoGasto = { ...item };
  }

  actualizarMovimiento(){
    this.api.actualizarGasto(this.nuevoGasto).pipe(take(1)).subscribe({ 
        //si todo va bien
      next: (respuesta: ApiResponse) => {
        // 2. Comprobamos qué nos ha dicho el PHP
        if (respuesta.resultado === 'OK') {
          this.resetForm();
          this.cargarMovimientos();
          this.mostrarFeedback(true,'¡Movimiento actualizado con éxito!');
        } else {
          this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
        }
      },
      //si hay error
      error: (err) => {
        this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
        console.error(err);
      }
     })
  }

  borrarGasto(id: number){
   //comfiguracion alerta para borrar con swal previamente instalado e importado
   Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás recuperar este movimiento',
    icon: 'warning',
    showCancelButton: true,
    //botonoes
    confirmButtonColor: '#910a0a',
    cancelButtonColor: '#1a6b2d',
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar',

    // La letra del mensje
    customClass: {
      container: 'mi-clase-fuente',
      popup: 'mi-clase-fuente',
      title: 'mi-clase-fuente'
    }

  }).then((resultado) => {

    if (resultado.isConfirmed) {
      this.api.eliminarMovimiento(id).pipe(take(1)).subscribe({
          //si todo va bien
        next: (respuesta: ApiResponse) => {
          // 2. Comprobamos qué nos ha dicho el PHP
          if (respuesta.resultado === 'OK') {
          
            this.cargarMovimientos();
            this.mostrarFeedback(true,'¡Movimiento Borrado con éxito!');
          } else {
            this.mostrarFeedback(false, '¡Vaya, algo ha fallado! 🚨');
          }
        },
        //si hay error
        error: (err) => {
          this.mostrarFeedback(false,  '¡Vaya, algo ha fallado! 🚨');
          console.error(err);
        }

      });
    }
   })
  }


 

  private resetForm() {
    this.nuevoGasto = {
      id: null,
      descripcion: '',
      fecha: '',
      importe: 0,
      categoria_id: 0,
      usuario_id: 0
    };
  }

  actualizarTotales(){
    this.totalIngresos = 0;
    this.totalGastos = 0;
    this.totalBalance = 0 ;

    this.misGastos.forEach(item =>{
      const importe = Number(item.importe);
      if (item.tipo_de_movimiento === 'ingreso'){
        this.totalIngresos += importe;
      } else {
        this.totalGastos += importe;
      }
    });
      this.totalBalance = this.totalIngresos - this.totalGastos;
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


 
}
