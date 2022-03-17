<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    @onskip="activeField = ''"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
  <TriageAlerts 
  @toggle-modal="alertController" 
  :covidTestAlert="covidTestAlert" 
  :emergenceAlert="emergenceAlert" 
  v-if="isVisible" 
/>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { VitalsService } from "@/apps/ART/services/vitals_service";
import { alertConfirmation, toastSuccess, toastWarning } from "@/utils/Alerts";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { BMIService } from "@/services/bmi_service";
import { ProgramService } from "@/services/program_service";
import ART_PROP from "@/apps/ART/art_global_props"
import { find, isEmpty } from "lodash";
import HisApp from "@/apps/app_lib";

import HisDate from "@/utils/Date"
import { EncounterService } from "@/services/encounter_service";
import { Encounter } from "@/interfaces/encounter";
import TriageAlerts from '@/apps/Triage/Components/TriageAlerts.vue';

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm,TriageAlerts },
  data: () => ({
    app: HisApp.getActiveApp() as any,
    activeField: "",
    age: null as any,
    gender: null as any,
    hasBPinfo: false,
    recentHeight: '',
    HTNEnabled: false,
    optionWhiteList: [] as string[],
    hasHTNObs: false,
    vitals: {} as any,
    weightForHeight: {} as any,
    medianWeightandHeight: {} as any,

    isVisible: false,
    currentDate: '',
    encounters: [] as Array<Encounter>,
    encounterID: '' as any,
    covidTestAlert: "" as any,
    emergenceAlert: "" as any,
    weight: '' ,
    temp: '' ,
    bp: '' ,
    pulse: '' ,
    spo2: '' ,
  }),
  watch: {
    patient: {
      async handler(patient) {
        await this.init(patient)
      },
      deep: true
    }
  },
  mounted(){
    this.getEncounter();
  },
  methods: {
    alertController(){
      this.isVisible = !this.isVisible;
      if(!this.isVisible)
      this.confirmPrinting();
    },
      openScreeningPage(id: number) {
      const params ={ name: "Screen Patient", params: { 'patient_id': id}} 
      this.$router.push(params)
    },
    async printNationalId()
    {
      const params ={ name: "Bluetooth Printer", params: { 'patient_id': this.patientID}} 
            this.$router.push(params)
    },
  async getEncounter()
  {
    this.currentDate = HisDate.currentDisplayDate();
    const currentDate = new Date(this.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const date = new Date(currentDate).toISOString().slice(0, 10);
    // const patientID: any = this.$route.params.patientID;
    const patientID: any = this.$route.params.patient_id;
    let bp1: any = "";
    let bp2: any = "";
    await EncounterService.getEncounters(patientID, {date}).then((data) => {
      this.encounters = data;
      for(const totalEncounters in this.encounters)
      {
        if(this.encounters[totalEncounters].observations.length > 0 && this.encounters[totalEncounters].encounter_type ==6)
        {
          this.encounterID = this.encounters[totalEncounters].encounter_id;
          for(const x in this.encounters[totalEncounters].observations)
          {
            const conceptID = this.encounters[totalEncounters].observations[x].concept_id;
            const valueNumeric = this.encounters[totalEncounters].observations[x].value_numeric+"";
            if(conceptID == 5089)
              this.weight = valueNumeric;
            if(conceptID == 5090)
              this.recentHeight = valueNumeric;
            if(conceptID == 5088)
              this.temp = valueNumeric;
            if(conceptID == 5085)
              bp1 = valueNumeric;
            if(conceptID == 5086)
              bp2 = valueNumeric;
            if(conceptID == 5092)
              this.spo2 = valueNumeric;
            if(conceptID == 5087)
              this.pulse = valueNumeric;
            if(bp1 != "" && bp2 != "")
              this.bp = bp1 +"/"+ bp2;
          }
        }
      }
    });
  },
    async init(patient: any) {
      const optionWhiteList = this.$route.query.vital_options as string
      this.vitals = new VitalsService(patient.getID(), this.providerID);
      this.age = patient.getAge();
      this.gender = patient.getGender();

      if (optionWhiteList) this.optionWhiteList = optionWhiteList.split(',')

      if (this.canCheckWeightHeight()) {
        const lastHeight = await patient.getRecentHeight();
        this.recentHeight = lastHeight == -1 ? null : lastHeight;
        if (this.age <= 14) {
          this.medianWeightandHeight = await patient.getMedianWeightHeight();
          this.weightForHeight = await ProgramService.getWeightForHeightValues();
        }
      }
      await VitalsService.getAll(patient.getID(), "Treatment status").then(
        (data: any) => {
          this.hasHTNObs = data && data.length > 0;
        }
      )
      this.HTNEnabled = await ART_PROP.htnEnabled()
      this.fields = this.getFields();
    },
    getOptions() {
      // const recentHeight = this.recentHeight && this.age > 18? this.recentHeight : "";
      // const showHeight = !(recentHeight && this.age > 18);
      if(!this.recentHeight)
      this.recentHeight ="";
      const options = [
        {
          label: "Temp",
          value: this.temp,
          other: { modifier: "°C", icon: "temp" },
        },
        { label: "BP", value: this.bp, other: { modifier: "mmHG", icon: "bp" } },
        {
          label: "Pulse",
          value: this.pulse,
          other: { modifier: "BPM", icon: "pulse-rate" },
        },
        
        {
          label: "SP02",
          value: this.spo2,
          other: { modifier: "%", icon: "spo2" },
        },
        
        {
          label: "Age",
          value: this.age,
          other: { modifier: "Years old", icon: "", visible: false },
        },
        {
          label: "Weight",
          value: this.weight,
          other: {
            modifier: "KG",
            icon: "weight",
          },
        },
        {
          label: "Height",
          value: `${this.recentHeight}`,
          other: {
            modifier: "CM",
            icon: "height",
            recentHeight: this.recentHeight,
            visible: true,
          },
        }
      ]

      if (!isEmpty(this.optionWhiteList)) {
        return options.filter((o: any) => this.optionWhiteList.includes(o.label))
          .map((o: any) => {
            o.other.required = true
            return o
          })
      }
      return options
    },
    canCheckWeightHeight() {
      return isEmpty(this.optionWhiteList) || this.optionWhiteList.includes('Height') 
        && this.optionWhiteList.includes('Weight')
    },
    canCheckBp() {
      return isEmpty(this.optionWhiteList) || this.optionWhiteList.includes('BP')
    },
    async onFinish(formData: any) {
      if(this.encounterID)
      await EncounterService.voidEncounter(this.encounterID, 'Duplicate');

      const encounter = await this.vitals.createEncounter();

      if (!encounter) return toastWarning("Unable to create treatment encounter");

       try {
        const obs = await this.buildObs(formData);
            const observations = await this.vitals.saveObservationList(obs);

            if (!observations) return toastWarning("Unable to save patient observations");

            toastSuccess("Vitals saved successfully");
      } catch (error) {
        toastWarning("Unable to save patient observations");
      }
   
      this.triageAlertsList(formData.vitals[0].value);
    },
      triageAlertsList(temp: any){
      this.covidTestAlert = this.$route.params.triageAlerts;
      if(temp >= 38)
        this.emergenceAlert = "The patient needs emergency attention";
      if(this.covidTestAlert != "null" || this.emergenceAlert)
        this.alertController();
      else
      this.confirmPrinting();
    },
    async confirmPrinting()
    {
      const confirmation = await alertConfirmation("Would you like to print a barcode ?", {
                confirmBtnLabel: 'Yes',
                cancelBtnLabel: 'No'
            });
      if (confirmation) 
        this.printNationalId()
      else
        this.goHome()
    },
    goHome()
    {
      this.$router.push('/triage');
      
    },
    async buildObs(formData: any) {
      const observations: any = await this.mapObs(
        this.sanitizeVitals(formData.vitals).filter(
          (element) => element.label !== "BP"
        )
      );
      if (this.HTNEnabled && !this.hasHTNObs) {
        const obs = await this.vitals.buildValueText(
          "Treatment status",
          formData.on_htn_medication.value
        );
        observations.push(obs);
      }
      return observations;
    },
    splitBP(formData: Option[]) {
      const p: Option[] = [];
      formData.forEach((element) => {
        if (element.label === "BP") {
          const value = `${element.value}`.split("/");
          const bpSystolic = value[0];
          const bpDiastolic = value[1];

          p.push({ label: "Systolic", value: bpSystolic });
          p.push({ label: "Diastolic", value: bpDiastolic });
        }
      });
      return p;
    },
    getBMI(formData: Option[]) {
      const weight = this.getVal(formData, "Weight");
      const height = this.getVal(formData, "Height");
      const obs: any = [];
      if (this.age <= 14) {
        const currentWeightPercentile = (
          (weight / parseFloat(this.medianWeightandHeight["weight"])) *
          100
        ).toFixed(0);
        const currentHeightPercentile = (
          (height / parseFloat(this.medianWeightandHeight["height"])) *
          100
        ).toFixed(0);
        const currentHeightRounded =
          (height % Math.floor(height) < 0.5 ? 0 : 0.5) + Math.floor(height);
        const medianWeightHeight =
          this.weightForHeight[currentHeightRounded.toFixed(1)];
        const weightForHeightPercentile = (
          (weight / medianWeightHeight) *
          100
        ).toFixed(0);
        if(!isNaN(parseFloat(weightForHeightPercentile))) {
          obs.push({
            label: "Weight for height percent of median",
            value: weightForHeightPercentile,
          });
        }
        obs.push({
          label: "Weight for age percent of median",
          value: currentWeightPercentile,
        });
        obs.push({
          label: "Height for age percent of median",
          value: currentHeightPercentile,
        });
      } else {
        const BMI = BMIService.calculateBMI(weight, height);
        obs.push({ label: "BMI", value: BMI });
      }
      return obs;
    },
    getVal(formData: Option[], val: string): number {
      const value = formData.filter((key: any) => key.label === val);
      return value[0].value === "" ? 0 : parseFloat(`${value[0].value}`);
    },
    async mapObs(vitals: any) {
      const j = vitals.map(async (element: any) => {
        const obs = await this.vitals.buildValueNumber(
          element.label,
          element.value
        );
        return obs;
      });
      return Promise.all(j);
    },
    validateVitals(vitals: any) {
      const l = this.checkRequiredVitals(vitals);
      if (l.length > 0) {
        return l.map((val) => {
          return [`${val.label} can not be empty`];
        });
      }
      const v = this.sanitizeVitals(vitals);
      return this.vitals.validateAll(v);
    },
    sanitizeVitals(vitals: Array<Option>) {
      let p = vitals.filter((element) => {
        if (element.label === "Height" && element.other.required == false) {
          return false;
        }
        return element.value !== "" && element.label !== "Age";
      })
      if (this.canCheckBp()) {
        p = p.concat(this.splitBP(p))
      }
      if (this.canCheckWeightHeight()){
        p = p.concat(this.getBMI(vitals))
      }
      return p
    },
    checkRequiredVitals(vitals: Array<Option>) {
      return vitals.filter((element) => {
        return element.value === "" && element.other.required === true;
      });
    },
    getFields(): Array<Field> {
      const HTNEnabled = this.HTNEnabled;
      const hasHTNObs = this.hasHTNObs;
      return [
        {
          id: "on_htn_medication",
          helpText: "Already taking drugs for blood pressure?",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          condition: () => {
            // This page is reused in other programs that's why we're adding
            // an ART check. 
            return HTNEnabled && !hasHTNObs && this.app?.applicationName === 'ART';
          },
          options: () => [
            {
              label: "Yes",
              value: "BP Drugs started",
            },
            {
              label: "No",
              value: "Not on BP Drugs",
            },
          ],
        },
        {
          id: "vitals",
          helpText: "Vitals entry",
          type: FieldType.TT_VITALS_ENTRY,
          validation: (value: any) => this.validateVitals(value),
          config: {
            hiddenFooterBtns : [
              'Clear'
            ],
            onUpdateAlertStatus: async (params: Option[]) => {
              const weightOption = find(params, { label: 'Weight'})
              const heightOption = find(params, { label: 'Height'})

              if (!(weightOption && heightOption)) return

              const weight = parseFloat(weightOption.value as string)
              const height = parseFloat(heightOption.value as string)

              if (weight <= 0 || height <=0) return { 
                label: 'BMI',
                value: 'N/A',
                color: '', 
                status: ''
              }

              const BMI = await BMIService.getBMI(weight, height, this.gender, this.age);

              return {
                label: 'BMI',
                value: BMI.index,
                color: BMI.color, 
                status: BMI.result
              }
            },
            onChangeOption: (activeItem: any) => {
              if (!activeItem.value && activeItem.other.required) {
                throw `Value for ${activeItem.label} is required`
              }else if (activeItem.value) {
                const errs = this.vitals.validator(activeItem)
                if(errs && errs.length) throw errs
              }
            }
          },
          options: () => this.getOptions(),
        },
      ];
    },
  },
});
</script>
