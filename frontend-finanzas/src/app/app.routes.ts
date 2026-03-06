import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
    // 1. Si el usuario escribe /login, mostramos el componente de Login
  { path: 'login', component: Login },

  // 2. Si el usuario escribe /dashboard, mostramos tu App de gastos
  { path: 'dashboard', component: Dashboard },

  // 3. RUTA POR DEFECTO: Si el usuario no escribe nada, lo mandamos al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 4. COMODÍN: Si escribe cualquier tontería que no existe, al login también
  { path: '**', redirectTo: 'login' }
];
