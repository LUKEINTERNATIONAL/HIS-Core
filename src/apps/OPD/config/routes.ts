export default [
    {
      name: "vitals",
      path: "/opd/encounters/vitals/:patient_id",
      component: () => import('@/apps/OPD/views/encounters/Vitals.vue')
    },
]
