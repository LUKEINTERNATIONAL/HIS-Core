<script lang="ts">
import { defineComponent } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface'
import { Patientservice } from "@/services/patient_service"
import { ProgramService } from "@/services/program_service"
import { PatientProgramService } from "@/services/patient_program_service"
import { UserService } from "@/services/user_service"
import { find } from "lodash"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { ENCOUNTER_GUIDELINES, FlowState } from "@/guidelines/encounter_guidelines"
import { matchToGuidelines } from "@/utils/GuidelineEngine"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        patient: {} as any,
        fields: [] as Array<Field>,
        patientID: '' as any,
        providerID: -1 as number,
        providers: [] as any,
        facts: {
            sessionDate: '' as string,
            apiDate: '' as string,
            encounterName: 'N/A' as string,
            providers: [] as Array<any>,
            isBdeMode: false as boolean,
            birthDate: '' as string,
            outcome: '' as string,
            outcomeStartDate: '' as string
        },
        ready: false
    }),
    watch: {
       '$route': {
            async handler(route: any) {
                if(route.params.patient_id && this.patientID != route.params.patient_id) {
                    this.patientID = route.params.patient_id;
                    const response = await Patientservice.findByID(this.patientID);
                    this.patient = new Patientservice(response);
                    await this.setEncounterFacts()
                    await this.checkEncounterGuidelines()
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
        runflowState(state: FlowState, params=null) {
            const states: any = {}
            states[FlowState.SET_PROVIDER] = (selection: any) => {
                const [ username ] = selection.split(' ')
                const provider = find(this.providers, { username })
                if (provider) this.providerID = provider.person_id
                return FlowState.CONTINUE
            }
            states[FlowState.CHANGE_SESSION_DATE] = () => { 
                this.$router.push(`/session/date?patient_dashboard_redirection_id=${this.patientID}`)
                return FlowState.EXIT
            }
            states[FlowState.CHANGE_PATIENT_OUTCOME] = () => {
                this.$router.push(`/patient/programs/${this.patientID}`)
                return FlowState.EXIT
            }
            states[FlowState.GO_TO_PATIENT_DASHBOARD] = () => {
                this.gotoPatientDashboard()
                return FlowState.EXIT
            }
            if (state in states) {
                return states[state](params)
            }
        },
        async checkEncounterGuidelines() {
            const findings = matchToGuidelines(this.facts, ENCOUNTER_GUIDELINES)
            for(const index in findings) {
                const finding = findings[index]
                if (finding?.actions?.alert) {
                    const status = this.runflowState((await finding?.actions?.alert(this.facts)))
                    if (status === FlowState.EXIT) return
                }
                if (finding?.actions?.selection) {
                    const selection = await finding?.actions?.selection(this.facts)
                    this.runflowState(selection.flowState, selection.value)
                }
            }
        },
        async setEncounterFacts() {
            const program = await new PatientProgramService(this.patientID).getProgram()
            this.facts.sessionDate = ProgramService.getSessionDate()
            this.facts.apiDate = ProgramService.getCachedApiDate() as string
            this.facts.isBdeMode = ProgramService.isBDE() as boolean
            this.facts.birthDate = this.patient.getBirthdate()
            this.facts.outcome = program.outcome
            this.facts.outcomeStartDate = program.startDate
            this.facts.encounterName = this.$route.name 
                ? this.$route.name.toString().toUpperCase()
                : 'N/A'
            if (ProgramService.isBDE()) {
                this.providers = await UserService.getUsers()
                this.facts.providers = this.providers.map((p: any) => `${p.username} \
                    (${p.person.names[0].given_name} ${p.person.names[0].family_name})`
                )
            }
        },
        patientDashboardUrl(): string {
            return `/patient/dashboard/${this.patientID}`
        },
        gotoPatientDashboard() {
            return this.$router.push({path: this.patientDashboardUrl()}) 
        },
        nextTask() {
            return nextTask(this.patientID, this.$router)
        },
        yesNoOptions(): Option[] {
            return [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" }
            ]
        },
        yesNoUnknownOptions(): Option[] {
            return [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
                { label: "Unknown", value: "Unknown" }
            ]
        },
        resolveObs(obs: any, tag='') {
            const values: any = Object.values(obs)
                .filter((d: any) => d && (d.tag === tag || tag === ''))
                .reduce((accum: any, cur: any) => { 
                    const data = cur.obs ? cur.obs : cur
                    if (Array.isArray(data)) {
                        accum = accum.concat(data)
                    } else {
                        accum.push(data)
                    }
                    return accum
                    }, [])
            return Promise.all(values)
        },
        inArray(arr: Array<any>, expression: (i: any) => boolean): boolean {
            try {
                return arr.filter((i: any) => expression(i)).length > 0
            } catch (e) {
                return false
            }
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
