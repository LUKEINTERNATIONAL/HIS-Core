export default [
  {
    name: "patient registration",
    path: "/opd/encounters/registration/:patient_id",
    component: () => import('@/apps/OPD/views/encounters/Registration.vue')
  },
]