<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { toastWarning, toastSuccess } from "@/utils/Alerts"
import EncounterMixinVue from './EncounterMixin.vue';
import {AppointmentService} from '@/apps/ART/services/appointment_service'
import { PatientPrintoutService } from "@/services/patient_printout_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    appointmentDate: "" as any,
    medicationRunOutDate: "" as any,
    appointment: {} as any
    
  }),
  watch: {
    patient: {
      async handler(patient: any) {
        this.appointment = new AppointmentService(patient.getID(), this.providerID);
        this.init();
      },
      deep: true
    },
  },
  methods: {
    async onFinish(formData: any, computedData: any) {
      const encounter = await this.appointment.createEncounter()

      if (!encounter) return toastWarning('Unable to create encounter')

      const appointmentObs = await this.resolveObs(computedData, 'obs');
      const systemDateObs = await this.appointment.buildValueDate('Estimated date', this.appointmentDate);
      appointmentObs.push(systemDateObs);

      const obs = await this.appointment.saveObservationList(appointmentObs)

      if (!obs) return toastWarning('Unable to create Obs')

      toastSuccess('Encounter created')
      const printer = new PatientPrintoutService(this.patientID);
      await printer.printVisitSummaryLbl();
      this.nextTask()
    },
    async init() {
    const appointments = await this.appointment.getNextAppointment();
    this.appointmentDate = appointments.appointment_date;
    this.medicationRunOutDate = appointments.drugs_run_out_date;

        this.fields = this.getFields();
    },
    getFields(): Array<Field> {
      return [
        {
          id: "set_appointment",
          helpText: "Appointments booking",
          type: FieldType.TT_APPOINTMENTS_ENTRY,
          validation: (val: any) => Validation.required(val),
          computedValue: (d: Option) => {
            return {
              tag: 'obs',
              obs: this.appointment.buildValueDate('Appointment date', d.value)
            }
          },
          config: {
            hiddenFooterBtns: [
                'Clear'
            ]
          },
          options: () =>  {return [{
            label: "",
            value: "",
            other: {
             runOutDate : this.medicationRunOutDate,
             appointmentDate: this.appointmentDate
            }
          }]},
        }
      ]
    }
  }
});
</script>