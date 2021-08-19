<script lang="ts">
import { defineComponent } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface'
import { Patientservice } from "@/services/patient_service"
import { ProgramService } from "@/services/program_service"
import { WorkflowService } from "@/services/workflow_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { optionsActionSheet } from "@/utils/ActionSheets"
import { UserService } from "@/services/user_service"
import { find } from "lodash"

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
                    await this.checkBDE()
                    this.patientID = route.params.patient_id;
                    const response = await Patientservice.findByID(this.patientID);
                    this.patient = new Patientservice(response);
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
            const modal = await optionsActionSheet(
                'Please select a provider',
                `BDE: ${ProgramService.getSessionDate()} | Current: ${ProgramService.getCachedApiDate()}`,
                providers,
                [
                    { name: 'Confirm', slot: 'end', role: 'action' }
                ]
            )
            return modal.selection
        },
        patientDashboardUrl() {
            return `/patient/dashboard/${this.patientID}`
        },
        gotoPatientDashboard() {
            return this.$router.push({path: this.patientDashboardUrl()}) 
        },
        async nextTask() {
            const params = await WorkflowService.getNextTaskParams(this.patientID)
            if (params.name) {
                this.$router.push(params)
            } else {
                this.gotoPatientDashboard()
            }
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
                  .filter((d: any) => d.tag === tag || tag === '')
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
