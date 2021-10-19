import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Login from '../views/Login/Login.vue'

import Home from '../views/Home.vue';
import Confirmation from '../views/Confirmation.vue';
import HClocation from '../views/HClocation.vue';
import SearchPatient from "@/views/SearchPatient.vue";
import SearchClient from '../views/SearchClient.vue'
import PatientRegistration from '../views/PatientRegistration.vue'
import GuardianRegistration from '../views/GuardianRegistration.vue'
import SearchResults from '../views/SearchResults.vue'
import Example from '../views/Example.vue'
import FindByID from '../views/FindByID.vue'
import PatientDashboard from '../views/PatientDashboard.vue'
import Configuration from '@/views/Configuration.vue'
import HisApps from '@/apps/his_apps';
import SessionDate from "@/views/SessionDate.vue"
import SystemUsage from "@/views/SystemUsage.vue"
import PrintLocation from "@/views/PrintLocation.vue"
import PortalSettings from "@/views/PortalSettings.vue"
import HostConfig from '@/views/HostConfig.vue'
import ProgramManagement from "@/views/ProgramManagement.vue"
import LabResults from "@/views/LabResults.vue"
import User from "@/views/NewUser.vue"
import PatientMerging from "@/views/PatientMerging.vue"

const HIS_APP_ROUTES = (() => {
  let routes: Array<RouteRecordRaw> = []
  HisApps.forEach(app => {
    if (app.appRoutes) {
      routes = [...routes, ...app.appRoutes]
    }
  })
  return routes
})()

const routes: Array<RouteRecordRaw> = [
  ...HIS_APP_ROUTES,
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: (to, from, next) => {
      if (!sessionStorage.getItem('apiKey')) {
          next('/login');
      }
      next();
    }, 
  },
  {
    name: 'Update site location',
    path:'/location/update/site',
    component: () => import('@/views/SiteLocation.vue')
  },
  {
    name: 'Update site code',
    path:'/location/update/code',
    component: () => import('@/views/SetSiteCode.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/search_patient',
    name: 'Search Patient',
    component: SearchPatient
  },
  {
    path: '/session/date',
    name: 'Session Date',
    component: SessionDate
  },
  {
    path: '/users/usage',
    name: 'User system usage',
    component: SystemUsage
  },
  {
    path: '/print/location',
    name: 'Print Location',
    component: PrintLocation
  },
  {
    path: '/select_hc_location',
    name: 'HC Location',
    component: HClocation
  },
  {
    path: '/search_client',
    name: 'Search client',
    component: SearchClient
  },
  {
    path: '/patient/dashboard/:id',
    name: 'Patient Dashboard',
    component: PatientDashboard
  },
  {
    path: '/patient/registration',
    name: 'Patient Registration',
    component: PatientRegistration
  },
  {
    path: '/guardian/registration',
    name: 'Guardian Registration',
    component: GuardianRegistration
  },
  {
    path: '/example',
    name: 'Example',
    component: Example
  },
  {
    path: '/patient/search_results',
    name: 'Patient Search results',
    component: SearchResults
  },
  {
    path: '/patients/search/id',
    name: 'ID Search',
    component: FindByID
  },
  {
    path: '/patients/confirm',
    name: 'Patient confirmation',
    component: Confirmation
  },
  {
    path: '/patients/merge',
    name: 'Patient Merging',
    component: PatientMerging
  },
  {
    path: '/patient/programs/:patient_id',
    name: 'Program(s)',
    component: ProgramManagement
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: Configuration
  },
  {
    path: '/user',
    name: 'User',
    component: User
  },
  {
    path: '/settings/host',
    name: 'API host settings',
    component: HostConfig
  },
  {
    path: '/lab/results/:patient_id',
    name: 'Lab Results',
    component: LabResults
  },
  {
    path: '/portal/config',
    name: 'Portal settings',
    component: PortalSettings
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
