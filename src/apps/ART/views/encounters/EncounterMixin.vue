<script lang="ts">
import HisDate from "@/utils/Date"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { defineComponent } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface'
import { Patientservice } from "@/services/patient_service"
import { ProgramService } from "@/services/program_service"
import { optionsActionSheet, infoActionSheet } from "@/utils/ActionSheets"
import { UserService } from "@/services/user_service"
import { find } from "lodash"
import { nextTask } from "@/utils/WorkflowTaskHelper"

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        patient: {} as any,
        programInfo: {} as any,
        fields: [] as Array<Field>,
        form: {} as Record<string, Option> | Record<string, null>,
        patientID: '' as any,
        providerID: -1 as number,
        providers: [] as any,
        bdeChecked: false as boolean,
        ready: false
    }),
    watch: {
       '$route': {
            async handler(route: any) {
                if(route.params.patient_id) {
                    this.patientID = route.params.patient_id;
                    const response = await Patientservice.findByID(this.patientID);
                    this.patient = new Patientservice(response);

                    const hasWarning = await this.warnIfSessionDataIsLessThanDob(this.patient.getBirthdate())
                    if (hasWarning) return

                    await this.checkBDE()
                    this.programInfo = await ProgramService.getProgramInformation(this.patientID)
                    this.ready = true;
                }
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        cancelDestination(): string {
            return this.patientDashboardUrl()
        }
    },
    methods: {
        async checkBDE() {
            if (ProgramService.isBDE() && !this.bdeChecked) {
                this.bdeChecked = true
                this.providers = await UserService.getUsers()
                const providerNames = this.providers.map((p: any) => `${p.username} \
                    (${p.person.names[0].given_name} ${p.person.names[0].family_name})`)

                const selection = await this.selectProvider(providerNames)
                const [ username ] = selection.split(' ')
                const provider = find(this.providers, { username })

                if (provider) this.providerID = provider.person_id
            }
        },
        async selectProvider(providers: Array<string>) {
            const toDate = (date: any) => HisDate.toStandardHisDisplayFormat(date)
            const encounterName = this.$route.name 
                ? this.$route.name.toString().toUpperCase()
                : 'Kaya'
            const modal = await optionsActionSheet(
                `Please select a provider for ${encounterName}`,
                `BDE: ${toDate(ProgramService.getSessionDate())} 
                    | Current: ${toDate(ProgramService.getCachedApiDate())}`,
                providers,
                [
                    { name: 'Confirm', slot: 'end', role: 'action' }
                ]
            )
            return modal.selection
        },
        async warnIfSessionDataIsLessThanDob(birthdate: string) {
            const bdeDate = HisDate.toStandardHisFormat(ProgramService.getSessionDate())
            const dob = HisDate.toStandardHisFormat(birthdate)
            if (ProgramService.isBDE() && bdeDate < dob) {
                const action = await infoActionSheet(
                    'Data Integrity Issue found', ``,
                    `Session date ${HisDate.toStandardHisDisplayFormat(bdeDate)} 
                     is less than birth date of ${HisDate.toStandardHisDisplayFormat(birthdate)}`,
                    [
                        { name: 'Cancel', slot: 'end', color: 'danger' },
                        { name: 'Change session date', slot: 'end', color: 'success' }
                    ],
                    'his-danger-color'
                )
                action === 'Cancel' ? this.gotoPatientDashboard() : this.$router.push('/session/date')
                return true
            }
            return false
        },
        patientDashboardUrl() {
            return `/patient/dashboard/${this.patientID}`
        },
        gotoPatientDashboard() {
            return this.$router.push({path: this.patientDashboardUrl()}) 
        },
        nextTask() {
            return nextTask(this.patientID, this.$router)
        },
        yesNoOptions() {
            return [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" }
            ]
        },
        yesNoUnknownOptions() {
            return [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
                { label: "Unknown", value: "Unknown" }
            ]
        },
        resolveObs(obs: any, tag='') {
            let values: Array<any> = []
            Object.values(obs)
                  .filter((d: any) => d && (d.tag === tag || tag === ''))
                  .forEach((data: any) => {
                    if (Array.isArray(data.obs)) {
                        values = [...values, ...data.obs]
                    } else {
                        values.push(data.obs)
                    }
                })
            return Promise.all(values)
        },
        validateSeries(conditions: Array<any>){
            try {
                for(const i in conditions) {
                    const condition = conditions[i]()

                    if (condition) return condition
                }
            } catch (e) {
                return [e]
            }
        }
    }
})
</script>
