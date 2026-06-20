import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/personaje/nuevo',
    name: 'create-character',
    component: () => import('../views/CharacterCreateView.vue')
  },
  {
    path: '/personaje/editar/:id',
    name: 'edit-character',
    // La vista de edición se construirá siguiendo la misma lógica de creación,
    // reutilizando el componente CharacterForm.
    component: () => import('../views/CharacterEditView.vue'), 
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router