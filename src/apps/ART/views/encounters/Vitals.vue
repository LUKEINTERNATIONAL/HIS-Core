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
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { VitalsService } from "@/apps/ART/services/vitals_service";
import { toastSuccess, toastWarning } from "@/utils/Alerts";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { BMIService } from "@/services/bmi_service";
import { ProgramService } from "@/services/program_service";
import ART_PROP from "@/apps/ART/art_global_props"
import { find, isEmpty } from "lodash";
import HisApp from "@/apps/app_lib"

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    app: HisApp.getActiveApp() as any,
    activeField: "",
    age: null as any,
    gender: null as any,
    hasBPinfo: false,
    recentHeight: null,
    HTNEnabled: false,
    optionWhiteList: [] as string[],
    hasHTNObs: false,
    vitals: {} as any,
    weightForHeight: {} as any,
    medianWeightandHeight: {} as any
  }),
  watch: {
    patient: {
      async handler(patient) {
        await this.init(patient)
      },
      deep: true
    }
  },
  methods: {
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
      const recentHeight = this.recentHeight && this.age > 18? this.recentHeight : "";
      const showHeight = !(recentHeight && this.age > 18);
      const options = [
        {
          label: "Weight",
          value: "",
          other: {
            modifier: "KG",
            icon: "weight",
            required: true,
          },
        },
        {
          label: "Height",
          value: `${recentHeight}`,
          other: {
            modifier: "CM",
            icon: "height",
            recentHeight: this.recentHeight,
            visible: showHeight,
            required: showHeight,
          },
        },
        { label: "BP", value: "", other: { modifier: "mmHG", icon: "bp" } },
        {
          label: "Temp",
          value: "",
          other: { modifier: "°C", icon: "temp" },
        },
        {
          label: "SP02",
          value: "",
          other: { modifier: "%", icon: "spo2" },
        },
        {
          label: "Pulse",
          value: "",
          other: { modifier: "BPM", icon: "pulse-rate" },
        },
        {
          label: "Age",
          value: this.age,
          other: { modifier: "Years old", icon: "", visible: false },
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
      const encounter = await this.vitals.createEncounter();

      if (!encounter) return toastWarning("Unable to create treatment encounter");

      const obs = await this.buildObs(formData);
      const observations = await this.vitals.saveObservationList(obs);

      if (!observations) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
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
