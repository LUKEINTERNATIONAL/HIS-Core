export default [
    {
        name: "cxca test",
        path: "/cxca/encounters/clinical_assessment/:patient_id",
        component: () => import('@/apps/CxCa/views/encounters/CxCaTest.vue')
    },
    {
        name: "cxca treatment",
        path: "/cxca/encounters/cancer_treatment/:patient_id",
        component: () => import('@/apps/CxCa/views/encounters/CxCaTreatment.vue')
    },
    {
        name: "cxca reception",
        path: "/cxca/encounters/cancer_reception/:patient_id",
        component: () => import('@/apps/CxCa/views/encounters/CxCaReception.vue')
    },
    {
        name: "cxca referral feedback",
        path: "/cxca/encounters/cancer_feedback/:patient_id",
        component: () => import('@/apps/CxCa/views/encounters/CxCaOutcome.vue')
    },
    {
        name: "cxca screening result",
        path: "/cxca/encounters/cancer_screening_result/:patient_id",
        component: () => import('@/apps/CxCa/views/encounters/CxCaScreeningResult.vue')
    },
    {
        name: "cxca result",
        path: "/cxca/encounters/cancer_result/:patient_id",
        component: () => import('@/apps/CxCa/views/encounters/CxCaResult.vue')
    },
    // {
    //     name: "order tests",
    //     path: "/los/forms/order/:patient_id",
    //     component: () => import('@/apps/LOS/views/OrderTests.vue')
    // },
]
