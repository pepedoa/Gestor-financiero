import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { FormsModule } from '@angular/forms';
import { Movimiento, Nuevomovimiento } from '../../interfaces/Movimientos';
import { ApiResponse } from '../../interfaces/ApiResponse';
import { Categorias } from '../../interfaces/Categorias';
import { CommonModule } from '@angular/common';
import { Usuarios } from '../../interfaces/Usuarios';
import Swal from 'sweetalert2';
import { take } from 'rxjs';//PARA CERRAR EL SUSCRIBE UNA VEZ RECIBE LOS DATOS
import { Router } from '@angular/router';
import {jsPDF} from 'jspdf';
import {autoTable} from 'jspdf-autotable';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';



@Component({
  selector: 'app-root',

  standalone: true,
  imports: [ FormsModule, CommonModule, BaseChartDirective],
  // Damos de alta los gráficos
  providers: [ provideCharts(withDefaultRegisterables()) ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  nombreFiltrado: string = '';
  idUsuario: number = 0;
  mensajeAlerta: string = '';
  Fallido: boolean =false;
  Exitoso: boolean =false;
  cerrandoAlerta: boolean = false;
  currentYear: number = new Date().getFullYear();
  nombreUsuario: string = '';
  columnaActual: string = ''; // Guardará qué columna estamos ordenando ahora mismo
  ordenAscendente: boolean = true; // Guardará si vamos de A-Z o de Z-A

 
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
 constructor(private api: Api, private router:Router) { }

 // 1. Creamos la variable que usará el HTML
  nombrePersona: string = '';

  ngOnInit() {
    this.cargarMovimientos();
    this.cargarCategorias();
    this.cargarUsuarios();

    // 2. Al cargar la página, recuperamos el nombre que guardamos en el login
    // Usamos el "Plan B" (||) por si acaso alguien borra el storage a mano
    this.nombrePersona = sessionStorage.getItem('nombre_usuario') || 'Usuario';
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

  obtenerMovimientosFiltrados(){
    if(this.nombreFiltrado === ''){
      return this.misGastos;
    } 
    //cogemos el array entero y vamos pasando cada movimiento atraves de la variable movimiento y lo comparamos con el input del filtro
    return this.misGastos.filter(movimiento => {
     return movimiento.descripcion.toLowerCase().includes(this.nombreFiltrado.toLowerCase()) || movimiento.fecha.includes(this.nombreFiltrado);
    });
  }

  borrarResultadosFiltrados(){
    const obtenerResultadoBusqueda = this.obtenerMovimientosFiltrados();

    // Transforma la lista de objetos en una lista de IDs
    const idsABorrar = obtenerResultadoBusqueda.map(movimiento => movimiento.id);
  
    Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a borrar ${idsABorrar.length} movimientos de forma permanente`,
    icon: 'warning',
    showCancelButton: true,
    //botonoes
    confirmButtonColor: '#991b1b',
    cancelButtonColor: '#166534',
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
      this.api.eliminarMovimientos(idsABorrar).pipe(take(1)).subscribe({
          //si todo va bien
        next: (respuesta: ApiResponse) => {
          // 2. Comprobamos qué nos ha dicho el PHP
          if (respuesta.resultado === 'OK') {
          
            this.cargarMovimientos();
            this.mostrarFeedback(true,'¡Movimiento/s Borrado/s con éxito!');
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
        console.log("Datos del error recibido:", err);

        let mensajeDinamico = "Hubo un problema con el servidor";

        // Intentamos sacar el mensaje exacto que escribiste en PHP
        // Si en PHP pusiste ["error" => "Sesión caducada"], aquí llega en err.error.error
        if (err.error && err.error.error) {
            mensajeDinamico = err.error.error; 
        } 
        // Si por lo que sea el error es un texto (el fallo del <br>), ponemos un aviso genérico
        else if (typeof err.error === 'string' && err.error.includes('<')) {
            mensajeDinamico = "Error técnico en el PHP (revisa la consola)";
        }

        // LANZAMOS TU ALERTA con el mensaje que viene del PHP
        this.mostrarFeedback(false, mensajeDinamico);
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
   //comfiguracion alerta para borrar con swal 
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
   });
  }

  descargarPDF() {
    // 1. Creamos un nuevo documento PDF (por defecto tamaño A4, vertical)
    const doc = new jsPDF();

    // 2. Le ponemos un título bonito en la posición (X: 14, Y: 10)
    doc.text('Resumen de Transacciones - ' + this.nombrePersona, 14, 10);

    // 3. Preparamos las columnas que tendrá nuestra tabla
    const columnasTabla = [['Descripción', 'Importe', 'Tipo', 'Fecha']];

    // 4. Transformamos nuestros datos (movimientos) al formato que pide el PDF
    const cuerpoTabla = this.misGastos.map(Movimiento => {
      return [
        Movimiento.descripcion,
        Movimiento.importe + '€', 
        Movimiento.tipo_de_movimiento,
        Movimiento.fecha
      ];
    });

    // 5. Dibujamos la tabla usando el ayudante "autoTable"
    autoTable(doc, {
      head: columnasTabla, // La cabecera
      body: cuerpoTabla,   // Los datos
      startY: 20,          // Empezamos a dibujar en la posición Y: 20 (dejando espacio al título)
      theme: 'grid',        // Estilo de la tabla ('striped', 'grid', 'plain')
      headStyles: {
        fillColor: '#910a0a'  // RGB del rojo oscuro de tu parche
      },
      didParseCell: (data) => {
        // data.row.raw contiene los datos de la fila: [Descripción, Importe, Tipo, Fecha]
        // Comprobamos la columna 2 (Tipo de movimiento)
        if (data.section === 'body') {
          const rawData = data.row.raw as string[]; // Le decimos a TypeScript que trate esto como un array
          const tipoMovimiento = rawData[2];//Accedemos a la columna de tipo de movimiento
          if (tipoMovimiento === 'ingreso') {
            data.cell.styles.textColor = [255, 0, 0]; // Rojo, como pediste
          } else if (tipoMovimiento === 'gasto') {
            data.cell.styles.textColor = [0, 128, 0]; // Verde, como pediste
          }
        }
      }
    });

    // 6. Forzamos la descarga del archivo
    doc.save('mis_gastos.pdf');
  }



 

  public resetForm() {
    this.nuevoGasto = {
      id: null,
      descripcion: '',
      fecha: '',
      importe: 0,
      categoria_id: 0,
      usuario_id: 0
    };
  }

  // --- CONFIGURACIÓN DEL GRÁFICO ---


  // --- FÁBRICA DE COLORES BASADA EN SENO (Trigonometría) ---
  private generarColorPorNombre(nombreCategoria: string): string {
    let numeroMagico = 0;
    
    for (let i = 0; i < nombreCategoria.length; i++) {
        // Sumamos el valor de la letra, pero lo multiplicamos por su posición (i + 1)
        // Así diferenciamos palabras que tengan las mismas letras desordenadas.
        numeroMagico += nombreCategoria.charCodeAt(i) * (i + 1);
    }
    
    // Math.sin devuelve un decimal infinito. Lo multiplicamos por 10000 para coger 'los picos'
    const entropia = Math.abs(Math.sin(numeroMagico) * 10000);
    
    // Sacamos nuestro color, saturación y brillo a partir de esa locura de decimales
    const tonoColor = Math.floor(entropia % 360);
    const saturacion = 60 + Math.floor((entropia * 2) % 20); // Entre 60 y 80%
    const luminosidad = 45 + Math.floor((entropia * 3) % 15); // Entre 45 y 60%
    
    return `hsl(${tonoColor}, ${saturacion}%, ${luminosidad}%)`;
  }




  // grafico 1
  public opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: {
       display: false
      }
    }
  };

  public datosGrafico = {
    labels: ['Total Ingresos', 'Total Gastos'], // Los títulos
    datasets: [
      { 
        data: [0, 0],  // Inicialmente arrancan a cero
        backgroundColor: ['#1a6b2d', '#910a0a'], // Un verde bonito y tu rojo especial
      }
    ]
  };

  //grafico 2
  public opcionesGraficoGastos = {
    responsive: true,
    plugins: {
      legend: {
       display: false
      }
    }
  };

  public datosGraficoGastos = {
    labels: [] as string[], // Lista de nombres (vacía al principio)
    datasets: [
      { 
        data: [] as number[], // Lista de números (vacía al principio)
        // Colores aleatorios para cada categoría!
        backgroundColor: [] as string[],
      }
    ]
  };

  // Gráfico 3: Desglose de Ingresos
public opcionesGraficoIngresos = {
   responsive: true,
    plugins: {
      legend: {
       display: false
      }
    }
};

public datosGraficoIngresos = {
  labels: [] as string[], 
  datasets: [
    { 
      data: [] as number[],
      // Te sugiero cambiar los colores para diferenciarlos (por ejemplo, tonos verdes o azulados)
      backgroundColor: [] as string[],
    }
  ]
};



  calcularGraficoGastos() {
      // 1. Creamos nuestro diccionario vacío
      const diccionarioGastos: any = {};
    
      this.misGastos.forEach(item => {
        const importe = Number(item.importe);
        
        if (item.tipo_de_movimiento === 'gasto') {
          const nombreDelGasto = item.descripcion; // Ej: "coche", "supermercado"

          // 2. ¿Existe ya la etiqueta "coche" en nuestro diccionario?
          if (diccionarioGastos[nombreDelGasto]) {
            // Si ya existe, le sumamos el importe nuevo a lo que ya tenía
            diccionarioGastos[nombreDelGasto] += importe;
          } else {
            // Si NO existe (es la primera vez que lo vemos), creamos la etiqueta 
            // con su importe inicial
            diccionarioGastos[nombreDelGasto] = importe;
          }
        } 
      });

      // Extraemos las listas limpias para el Gráfico
      const nombres = Object.keys(diccionarioGastos); // ['Coche', 'Pan']
      const valores = Object.values(diccionarioGastos) as number[]; // [19000, 2]
      const colores = nombres.map(nombreCategoria => this.generarColorPorNombre(nombreCategoria));

      // Inyectamos esto en nuestra configuración del Gráfico 2
      this.datosGraficoGastos.labels = nombres;
      this.datosGraficoGastos.datasets[0].data = valores;
      // Inyectamos nuestros colores frescos:
      this.datosGraficoGastos.datasets[0].backgroundColor = colores;
      
      // Forzamos que se redibuje por si hay cambios
      this.datosGraficoGastos = { ...this.datosGraficoGastos };
  }

  calcularGraficoIngresos() {
      // 1. Creamos nuestro diccionario vacío
      const diccionarioIngresos: any = {};
    
      this.misGastos.forEach(item => {
        const importe = Number(item.importe);
        
        if (item.tipo_de_movimiento === 'ingreso') {
          const nombreDelIngreso = item.descripcion; // Ej: "coche", "supermercado"

          // 2. ¿Existe ya la etiqueta "coche" en nuestro diccionario?
          if (diccionarioIngresos[nombreDelIngreso]) {
            // Si ya existe, le sumamos el importe nuevo a lo que ya tenía
            diccionarioIngresos[nombreDelIngreso] += importe;
          } else {
            // Si NO existe (es la primera vez que lo vemos), creamos la etiqueta 
            // con su importe inicial
            diccionarioIngresos[nombreDelIngreso] = importe;
          }
        } 
      });

      // Extraemos las listas limpias para el Gráfico
      const nombres = Object.keys(diccionarioIngresos); // ['Coche', 'Pan']
      const valores = Object.values(diccionarioIngresos) as number[]; // [19000, 2]
      const colores = nombres.map(nombreCategoria => this.generarColorPorNombre(nombreCategoria));

      // Inyectamos esto en nuestra configuración del Gráfico 2
      this.datosGraficoIngresos.labels = nombres;
      this.datosGraficoIngresos.datasets[0].data = valores;
       // Inyectamos nuestros colores frescos:
      this.datosGraficoIngresos.datasets[0].backgroundColor = colores;
      
      // Forzamos que se redibuje por si hay cambios
      this.datosGraficoIngresos = { ...this.datosGraficoIngresos };
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
      // Inyectamos nuestros cálculos en las "bandejas" de datos del gráfico
      this.datosGrafico.datasets[0].data = [this.totalIngresos, this.totalGastos];
      // Le decimos a Angular que el gráfico ha mutado para que lo redibuje
      this.datosGrafico = { ...this.datosGrafico }; 
      //ejecutamos funcion grafica  2
      this.calcularGraficoGastos();
      //grafica3
      this.calcularGraficoIngresos();

  }

  ordenarPor(columna: string) {
    if (columna === this.columnaActual ){
        this.ordenAscendente = !this.ordenAscendente; // Lo invierte cada vez
    } else {
      this.columnaActual = columna;
      this.ordenAscendente = true;
    }

    this.misGastos.sort((a: any, b: any) => {
      // 1. Conseguir el valor concreto de la columna a comparar
      let valorA = a[this.columnaActual];
      let valorB = b[this.columnaActual];
      //  Si es el importe, lo forzamos a número por si acaso:
      if (this.columnaActual === 'importe') {
          valorA = Number(valorA);
          valorB = Number(valorB);
      }
      // Si es fecha, la convertimos a tiempo (número) para comparar real
      if (this.columnaActual === 'fecha') {
        valorA = new Date(valorA).getTime();
        valorB = new Date(valorB).getTime();
      }
      
      // 2. Aquí es donde tú tienes que decidir quién gana la comparación
      let resultado = 0;

       if (valorA < valorB) {
        resultado = -1;
      } else if (valorA > valorB) {
        resultado = 1;
      }

      if (this.ordenAscendente) {
        return resultado;
      } else {
        return -resultado;
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

  private resetearformulario(){
   
  }

  cerrarSesion() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login'])
  }




 
}
