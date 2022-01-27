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
import { FieldType } from "@/components/Forms/BaseFormElements";
import { FooterBtnEvent, Option } from "@/components/Forms/FieldInterface";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { alertAction, toastSuccess, toastWarning } from "@/utils/Alerts";
import HisDate from "@/utils/Date";
import { findIndex, isEmpty, find } from "lodash";
import { ConsultationService } from "@/apps/ART/services/consultation_service";
import { UserService } from "@/services/user_service";
import { OrderService } from "@/services/order_service";
import { ConceptService } from "@/services/concept_service";
import AdherenceMixinVue from "./AdherenceMixin.vue";
import { modalController } from "@ionic/vue";
import VLReminderModal from "@/components/DataViews/VLReminderModal.vue";
import { ProgramService } from "@/services/program_service";
import { ARTLabService } from "../../services/lab_service";
import { infoActionSheet } from "@/utils/ActionSheets";
import SideEffectsModalVue from "@/components/DataViews/SideEffectsModal.vue";
import ART_PROP from "@/apps/ART/art_global_props";

export default defineComponent({
  mixins: [AdherenceMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    labOrderFieldContext: {} as any,
    prescriptionContext: {} as any,
    consultation: {} as any,
    hasTBTherapyObs: false,
    allergicToSulphur: false,
    TBSuspected: false,
    presentedTBSymptoms: false,
    pregnancy: [] as any,
    currentFPM: [] as any,
    newFPM: [] as any,
    reasonForNoFPM: {} as any,
    specificReasonForNoFPM: {} as any,
    offerContraceptives: {} as any,
    sideEffects: [] as any,
    otherSideEffects: [] as any,
    tbObs: {} as any,
    tbSideEffectsObs: [] as any,
    tbStatusObs: {} as any,
    treatmentStatusObs: {} as any,
    sulphurObs: {} as any,
    referObs: {} as any,
    medicationObs: [] as any,
    relatedObs: [] as any,
    askAdherence: false as boolean,
    lastDrugsReceived: [] as any,
    sideEffectsHistory: [] as any,
    onPermanentFPMethods: false,
    guardianVisit: false
  }),
  watch: {
    ready: {
      async handler(value: boolean) {
        if (value) {
          this.consultation = new ConsultationService(
            this.patientID,
            this.providerID
          );
          await this.initAdherence(this.patient, this.providerID);
          await this.getSideEffectsHistory();
          await this.guardianOnlyVisit();
          this.askAdherence = this.adherence.receivedDrugsBefore();
          this.fields = this.getFields();
          this.onPermanentFPMethods = await this.consultation.getTLObs();
          this.lastDrugsReceived = await this.consultation.getPreviousDrugs();

          this.completedTBTherapy();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async onFinish(formData: any) {
      this.setDrugOrderObs(formData.prescription);
      const encounter = await this.consultation.createEncounter();

      if (!encounter) return toastWarning("Unable to create encounter");

      const data = await Promise.all([
        ...this.pregnancy,
        ...this.currentFPM,
        ...this.newFPM,
        this.reasonForNoFPM,
        this.specificReasonForNoFPM,
        this.offerContraceptives,
        ...this.sideEffects,
        ...this.otherSideEffects,
        this.tbObs,
        ...this.tbSideEffectsObs,
        this.tbStatusObs,
        this.treatmentStatusObs,
        this.sulphurObs,
        this.referObs,
        ...this.medicationObs,
        ...this.relatedObs,
      ]);

      const filtered = data.filter((d) => !isEmpty(d));

      const obs = await this.consultation.saveObservationList(filtered);

      if (this.askAdherence && !this.guardianVisit) await this.saveAdherence();

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    isGender(gender: string) {
      return this.patient.getGender() === gender;
    },
    async guardianOnlyVisit() {
      const val = await this.consultation.getClient();
      this.guardianVisit = val === "No";
    },
    async checkVLReminder() {
      const vals = await ProgramService.getPatientVLInfo(this.patientID);
      if (vals.eligibile === true) {
        const modal = await modalController.create({
          component: VLReminderModal,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: { VLData: vals },
        });
        modal.present();
        const { data } = await modal.onDidDismiss();
        switch (data) {
          case "order":
            await this.labOrderFieldContext.launchOrderSelection();
            break;
          case "wait":
            await this.waitForVL();
            break;
          case "later":
            break;
          default:
            break;
        }
      }
    },
    async waitForVL(milestone: any = null) {
      const orderService = new ARTLabService(this.patientID, this.providerID);

      const encounter = await orderService.createEncounter();
      const observations = await orderService.buildDefferedOrder(milestone);
      if (!encounter) return toastWarning("Unable to create encounter");
      await orderService.saveObservationList(observations);
    },
    async getSideEffectsHistory() {
      const rows = [];
      const sides = await this.consultation.getDrugSideEffects();
      for (const key in sides) {
        const item = sides[key];
        const  date = HisDate.toStandardHisDisplayFormat(key);
        const rowData = [];
        for (const innerKey in item) {
          const innerItem = item[innerKey];
          const drug = innerItem.drug_induced ? `(Drug induced) ${innerItem.drug}` : `(Not drug induced)`; 
          rowData.push(innerItem.name, drug)
        }
        rows.push([date, rowData.join('\n')]);
      }
      this.sideEffectsHistory = rows;
    },
    async completedTBTherapy() {
      const obs = await this.patient.getCompleteTBTherapyHistory();
      this.hasTBTherapyObs = obs.length > 0;
    },
    isOfChildBearingAge() {
      const age = this.patient.getAge();
      return age >= 9 && age <= 55;
    },
    ontubalLigation() {
      return !this.onPermanentFPMethods;
    },
    showPregnancyQuestions() {
      return (
        this.isGender("F") &&
        this.isOfChildBearingAge() &&
        this.ontubalLigation()
      );
    },
    showCurrentContraceptionMethods(formData: any) {
      return this.showPregnancyQuestions() && !this.isPregnant(formData);
    },
    showNewContraceptionMethods(formData: any) {
      return (
        this.showPregnancyQuestions() &&
        !this.isPregnant(formData) &&
        !this.isOnTubalLigation(formData)
      );
    },
    isPregnant(formData: any) {
      return (
        formData.pregnant_breastfeeding.filter(
          (data: any) => data.value === "Yes"
        ).length > 0
      );
    },
    isOnTubalLigation(formData: any) {
      return (
        formData.current_fp_methods.filter(
          (data: any) => data.value === "TUBAL LIGATION"
        ).length > 0
      );
    },
    offerCxCa() {
      //if is a female and cervical cancer is enabled
      return this.isGender("F");
    },
    disableFPMethods(listData: Array<Option>, value: Option) {
      if (value.isChecked && value.label === "NONE") {
        return listData.map((i) => {
          if (i.label != "NONE") {
            i.isChecked = false;
            i.disabled = false;
          }
          return i;
        });
      } else if (value.label != "NONE" && value.isChecked) {
        if (value.label.match(/condom/gi)) {
          alertAction("Combine with other modern methods of family planning", [
            {
              text: "OK",
              handler: () => null,
            },
          ]);
        }
        const noneIndex = findIndex(listData, { label: "NONE" });
        listData[noneIndex].isChecked = false;
        const vals = this.consultation.familyPlanningMethods(
          value.label,
          listData
        );
        const currentIndex = findIndex(vals, { label: value.label });
        vals[currentIndex].isChecked = true;
        return vals;
      } else {
        return listData.map((i) => {
          i.disabled = false;
          return i;
        });
      }
    },
    disablePrescriptions(listData: Array<Option>, value: Option) {
      if (value.isChecked && value.label === "NONE OF THE ABOVE") {
        return listData.map((i) => {
          if (i.label != "NONE OF THE ABOVE") i.isChecked = false;
          return i;
        });
      } else if (value.label != "NONE OF THE ABOVE" && value.isChecked) {
        const noneIndex = findIndex(listData, { label: "NONE OF THE ABOVE" });
        listData[noneIndex].isChecked = false;
      }
      return listData;
    },
    setDrugOrderObs(listData: Array<Option>) {
      let prescribeDrugs = "Yes";
      listData.forEach((element) => {
        if (element.label != "NONE OF THE ABOVE" && element.isChecked) {
          this.medicationObs.push(
            this.consultation.buildValueCoded(
              "Medication orders",
              element.label
            )
          );
        }
        if (element.label === "NONE OF THE ABOVE" && element.isChecked) {
          prescribeDrugs = "No";
        }
      });
      this.medicationObs.push(
        this.consultation.buildValueCoded("Prescribe drugs", prescribeDrugs)
      );
    },
    declinedFPM(formData: any) {
      if (!formData.fp_methods) return false;
      return (
        formData.fp_methods.filter((data: any) => data.value === "NONE")
          .length > 0
      );
    },
    riskOfUnplannedPregnancy(formData: any) {
      if (!formData.reason_for_no_fpm) return false;
      return (
        formData.reason_for_no_fpm.value === "At risk of unplanned pregnancy"
      );
    },
    acceptedIntervention(formData: any) {
      if (!formData.offer_contraceptives) return false;
      return formData.offer_contraceptives.value === "Accepted";
    },
    notOnTBTreatment(formData: any) {
      if (!formData.on_tb_treatment) return false;
      return formData.on_tb_treatment.value === "No";
    },
    declinedCxCa(formData: any) {
      if (!formData.offer_cxca) return false;
      return formData.offer_cxca.value === "No";
    },
    updateCompletedTPT(formData: any) {
      if (formData.value.match(/Complete/gi)) {
        this.hasTBTherapyObs = true;
      } else {
        this.hasTBTherapyObs = false;
      }
    },
    showOtherSideEffects(formData: any) {
      return (
        formData.side_effects.filter((data: any) => {
          return data.label === "Other" && data.value === "Yes";
        }).length > 0
      );
    },
    hasTBSymptoms(formData: any) {
      if (!formData.tb_side_effects) return false;
      const val =
        formData.tb_side_effects.filter((data: any) => {
          return data.value === "Yes";
        }).length > 0;
      this.presentedTBSymptoms = val;
      return val;
    },
    getFieldPreset() {
      if (this.presentedTBSymptoms) {
        return { label: "TB Suspected", value: "TB Suspected" };
      }
    },
    getYesNo() {
      return [
        {
          label: "yes",
          value: "Yes",
        },
        {
          label: "no",
          value: "No",
        },
      ];
    },
    async getSideEffectsReasons(sideEffects: Option[]) {
      const lastDrugs: any = this.lastDrugsReceived
      const allYes = sideEffects.filter(
        (sideEffect) => sideEffect.value === "Yes" && sideEffect.label  !== "Other"
      );
      if (allYes.length >= 1) {
        const modal = await modalController.create({
          component: SideEffectsModalVue,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: { sideEffects: allYes, drugs: lastDrugs },
        });
        modal.present();
        const { data } = await modal.onDidDismiss();
        return data;
      }
      return -1
    },
    getFPMethods(exclusionList: string[] = [], preChecked: Array<Option>) {
      const methods = this.consultation.getFamilyPlanningMethods();
      const filtered = methods.filter(
        (data: string) => !exclusionList.includes(data)
      );
      return filtered.map((method: any) => ({
        label: method,
        value: method,
        isChecked: preChecked.map((i) => i.label).includes(method),
      }));
    },
    async getOptions(options: string[], preValues: Array<Option>) {
      return options.map((data: any) => {
        const preValue = find(preValues, { label: data });
        return {
          label: data,
          value: preValue ? preValue.value : "",
          other: {
            values: this.getYesNo(),
          },
        };
      });
    },
    getContraindications(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "contraindication"
      ).map((data) => data.name);
      return this.getOptions([...contraIndications, "Other"], preValues);
    },
    getOtherContraindications(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "side_effect"
      ).map((data) => data.name);
      return this.getOptions(
        [...contraIndications, "Other (Specify)"],
        preValues
      );
    },
    getTBSymptoms(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "tb_symptom"
      ).map((data) => data.name);
      return this.getOptions([...contraIndications], preValues);
    },
    runAppendOptionParams(options: Option[]) {
      return options.map(o => {
        if (typeof o?.other?.appendOptionParams === 'function') {
          const appendedOptions = o?.other?.appendOptionParams()
          if (typeof appendedOptions === 'object')  {
            const option: Option = {
              label: o.label,
              value: o.value,
              other: o.other
            }
            if (appendedOptions.isChecked) {
              option.isChecked = appendedOptions.isChecked
              delete appendedOptions.isChecked
            } else {
              option.isChecked = o.isChecked || false
            }
            return { ...option, ...appendedOptions}
          }
        }
        return o
      })
    },
    getPrescriptionFields(): Option[] {
      return this.runAppendOptionParams([
        { 
          label: "ARVs", 
          value: "ARVs", 
        },
        {
          label: "CPT", 
          value: "CPT",
          other: {
            appendOptionParams: () => {
              if (this.allergicToSulphur) {
                return {
                  disabled: true,
                  isChecked: false,
                  description: {
                    show: "always",
                    text: "Allergic to CPT",
                    color: "danger"
                  }
                }
              }
              return { disabled: false }
            }
          }
        },
        { 
          label: "3HP (RFP + INH)", 
          value: "3HP (RFP + INH)", 
          other: {
            appendOptionParams: () => {
              if (this.hasTBTherapyObs) {
                return {
                  disabled: true,
                  description: {
                    show: 'always',
                    color: 'danger',
                    text: 'Completed TPT',
                  }
                }
              }
              if (this.TBSuspected) {
                return { 
                  disabled: true, 
                  description: {
                    show: "always", 
                    text: 'TB Suspect',
                    color: 'danger'
                  }
                }
              }
            }
          }
        },
        {
          label: "IPT", 
          value: "IPT", 
          other: {
            appendOptionParams: () => {
              if (this.hasTBTherapyObs) {
                return { 
                  disabled: true, 
                  description: {
                    show: 'always',
                    color: 'danger',
                    text: 'Completed TPT',
                  }
                }
              }
              if (this.TBSuspected) {
                return { 
                  disabled: true, 
                  description: { 
                    show: "always", 
                    text: 'TB Suspect',
                    color: 'danger'
                  } 
                }
              }
            }
          }
        },
        { 
          label: "NONE OF THE ABOVE", 
          value: "NONE OF THE ABOVE" 
        }
      ])
    },
    getFields(): any {
      return [
        {
          id: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disablePrescriptions(listData, value);
          },
          options: (_: any, c: Array<Option>, cd: any, l: any) => {
            return !isEmpty(l) ? l : this.getPrescriptionFields()
          },
          unload: (data: any, state: any, formData: any) => this.onFinish(formData),
          condition: () => this.guardianVisit, 
        },
        {
          id: "patient_lab_orders",
          helpText: "Lab orders",
          type: FieldType.TT_LAB_ORDERS,
          unload: () => this.checkVLReminder(),
          onload: (fieldContext: any) => {
            this.labOrderFieldContext = fieldContext;
          },
          options: async () => {
            const orders = await OrderService.getOrders(this.patientID);
            const VLOrders = OrderService.formatLabs(orders);
            return [
              {
                label: "Lab orders",
                value: "order trail",
                other: {
                  values: VLOrders,
                },
              },
            ];
          },
          config: {
            hiddenFooterBtns: ["Clear"],
            footerBtns: [
              {
                name: "Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => {
                  if (!isEmpty(this.labOrderFieldContext)) {
                    await this.labOrderFieldContext.launchOrderSelection();
                  }
                }
              }
            ]
          },
        },
        {
          id: "pregnant_breastfeeding",
          helpText: `Patient Pregnant or breastfeeding?`,
          condition: () => this.showPregnancyQuestions(),
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          unload: (data: any) => {
            if (data) {
              this.pregnancy = data.map((data: Option) => {
                return this.consultation.buildValueCoded(
                  data.other.concept,
                  data.value
                );
              });
            }
          },
          options: () => [
            {
              label: "Pregnant",
              value: "",
              other: {
                values: this.getYesNo(),
                concept: "Is patient pregnant",
              },
            },
            {
              label: "Breastfeeding",
              value: "",
              other: {
                values: this.getYesNo(),
                concept: "Is patient breast feeding",
              },
            },
          ],
        },
        {
          id: "patient_weight_chart",
          helpText: "Patient weight chart",
          type: FieldType.TT_WEIGHT_CHART,
          options: async () => {
            const bmi = await this.patient.getBMI();
            const values = await this.patient.getWeightHistory();
            return [
              {
                label: "Weight for patient",
                value: "Weight trail",
                other: {
                  bmi,
                  values: values.map((d: any) => ({
                    x: HisDate.toStandardHisDisplayFormat(d.date),
                    y: d.weight,
                  })),
                  age: this.patient.getAge(),
                },
              },
            ];
          },
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
        {
          id: "has_fp_methods",
          helpText: "",
          condition: (formData: any) =>
            this.onPermanentFPMethods,
          type: FieldType.TT_TEXT_BANNER,
          options: () =>
            {
              return [
                {
                  label: "Patient is on Tubal ligation method",
                  value: "Patient is on Tubal ligation method"
                }
              ]
            },
        },
        {
          id: "current_fp_methods",
          helpText: "What method are you currently on?",
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          unload: (data: any) => {
            this.currentFPM = data.map((data: Option) => {
              return this.consultation.buildValueCoded('Family planning method', data.value);
            });
          },
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) =>
            this.showCurrentContraceptionMethods(formData),
          type: FieldType.TT_MULTIPLE_SELECT,
          options: (_: any, checked: Array<Option>) =>
            this.getFPMethods([], checked),
        },
        {
          id: "fp_methods",
          condition: (formData: any) =>
            this.showNewContraceptionMethods(formData),
          helpText: "What method are you providing today?",
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          unload: (data: any) => {
            this.newFPM = data.map((data: Option) => {
              return this.consultation.buildValueCoded('Family planning, action to take', data.value);
            });
          },
          type: FieldType.TT_MULTIPLE_SELECT,
          options: (_: any, checked: Array<Option>) =>
            this.getFPMethods([], checked),
        },
        {
          id: "reason_for_no_fpm",
          helpText: "Main reason for not using family planning methods",
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.declinedFPM(formData),
          unload: (data: any) => {
            this.reasonForNoFPM = this.consultation.buildValueText(
              "Why does the woman not use birth control",
              data.value
            );
          },
          type: FieldType.TT_SELECT,
          options: () => {
            return [
              { label: "Not Sexually active", value: "Not Sexually active" },
              {
                label: "Patient want to get pregnant",
                value: "Patient want to get pregnant",
              },
              {
                label: "Not needed for medical reasons",
                value: "Not needed for medical reasons",
              },
              {
                label: "At risk of unplanned pregnancy",
                value: "At risk of unplanned pregnancy",
              },
            ];
          },
        },
        {
          id: "specific_reason_for_no_fpm",
          helpText: "Specific reason for not using family planning methods",
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          unload: (data: any) => {
            this.specificReasonForNoFPM = this.consultation.buildValueText(
              "Reason for not using contraceptives",
              data.value
            );
          },
          type: FieldType.TT_SELECT,
          options: () => {
            return [
              {
                label: "Following wishes of spouse",
                value: "Following wishes of spouse",
              },
              { label: "Religious reasons", value: "Religious reasons" },
              {
                label: "Afraid of side effects",
                value: "Afraid of side effects",
              },
              {
                label: "Never though about it",
                value: "Never though about it",
              },
              {
                label: "Indifferent (does not mind getting pregnant)",
                value: "Indifferent (does not mind getting pregnant)",
              },
            ];
          },
        },
        {
          id: "offer_contraceptives",
          helpText: "Offer contraceptives",
          //show when previous one has a value
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          unload: (data: any) => {
            this.offerContraceptives = this.consultation.buildValueCoded(
              "Family planning, action to take",
              data.value
            );
          },
          type: FieldType.TT_SELECT,
          options: () => {
            return [
              { label: "Accepted", value: "Accepted" },
              { label: "Declined", value: "Declined" },
              { label: "Discuss with spouse", value: "Discuss with spouse" },
            ];
          },
        },
        {
          id: "offered_intervention",
          helpText: "Offered intervention",
          //show when the previous one is accepted
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.acceptedIntervention(formData),
          type: FieldType.TT_MULTIPLE_SELECT,
          unload: (data: any) => {
            this.newFPM = data.map((data: Option) => {
              return this.consultation.buildValueCoded(data.label, data.value);
            });
          },
          options: (_: any, checked: Array<Option>) =>
            this.getFPMethods(["NONE"], checked),
        },
        {
          id: 'previous_side_effects',
          helpText: 'Side effects / Contraindications history',
          type: FieldType.TT_TABLE_VIEWER,
          options: () => {
            let columns = ['Date', 'Condition'] as any;
            let rows = [];
            if(this.sideEffectsHistory.length === 0) {
              columns = [''];
              rows = [['No Past', 'side effects / contraindications']];
            }else {
              rows = this.sideEffectsHistory;
            }
            return [{
              label: 'Side effects / Contraindications history',
              value: 'trail',
              other: {
                columns, rows
              }
            }]
          },
        },
        {
          id: "side_effects",
          helpText:
            "Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          beforeNext: async (data: any) => {
            const reasons = await this.getSideEffectsReasons(data);
            if (reasons != -1) {
              if (reasons === undefined) {
                return false
              }
              const concept = ConceptService.getCachedConceptID("Drug induced");
              const sides = reasons.map((r: any) => {
                const c = ConceptService.getCachedConceptID(r.label);
                if (r.reason === "other" || r.reason === "drug") {
                  return {
                    'concept_id': concept,
                    'value_coded': c,
                    'value_text': "Past medication history",
                  };
                } else {
                  return {
                    'concept_id': concept,
                    'value_coded': c,
                    'value_drug': r.reason,
                  };
                }
              });
              this.relatedObs = [...this.relatedObs, ...sides];
            }
            this.sideEffects = await data.map(async (data: Option) => {
              const host = await this.consultation.buildValueCoded(
                "Malawi ART side effects",
                data.label
              );
              const child = await this.consultation.buildValueCoded(
                data.label,
                data.value
              );
              return {
                ...host,
                child: {
                  ...child,
                },
              };
            });
            return true
          },
          options: (_: any, checked: Array<Option>) => this.getContraindications(checked)
        },
        {
          id: "other_side_effects",
          condition: (formData: any) => this.showOtherSideEffects(formData),
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          helpText:
            "Other Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          unload: async (data: any) => {
            const reasons = await this.getSideEffectsReasons(data);
            const concept = ConceptService.getCachedConceptID("Drug induced");
            const sides = reasons.map((r: any) => {
              const c = ConceptService.getCachedConceptID(r.label);
              if (r.reason === "other" || r.reason === "drug") {
                return {
                  'concept_id': concept,
                  'value_coded': c,
                  'value_text': "Past medication history",
                };
              } else {
                return {
                  'concept_id': concept,
                  'value_coded': c,
                  'value_drug': r.reason,
                };
              }
            });
            this.relatedObs = [...this.relatedObs, ...sides];
            const filtered = data.filter((d: any) => {
              return d.label !== "Other (Specify)";
            });
            this.otherSideEffects = await filtered.map(async (data: Option) => {
              const host = await this.consultation.buildValueCoded(
                "Other side effect",
                data.label
              );
              const child = await this.consultation.buildValueCoded(
                data.label,
                data.value
              );
              return {
                ...host,
                child: {
                  ...child,
                },
              };
            });
          },
          options: (_: any, checked: Array<Option>) =>
            this.getOtherContraindications(checked),
        },
        {
          id: "on_tb_treatment",
          helpText: "On TB Treatment?",
          validation: (data: any) => Validation.required(data),
          type: FieldType.TT_SELECT,
          unload: async (data: any) => {
            if (data.value === "Yes") {
              this.TBSuspected = true;
            } else {
              this.TBSuspected = false;
            }
            this.tbObs = this.consultation.buildValueCoded(
              data.label,
              data.value
            );
          },
          options: () => this.getYesNo(),
        },
        {
          id: "tb_side_effects",
          helpText: "TB Associated symptoms",
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          condition: (formData: any) => this.notOnTBTreatment(formData),
          unload: async (vals: any) => {
            const val =
              vals.filter((data: any) => {
                return data.value === "Yes";
              }).length > 0;
            this.presentedTBSymptoms = val;
            this.tbSideEffectsObs = await vals.map(async (data: Option) => {
              const host = await this.consultation.buildValueCoded(
                "Routine TB Screening",
                data.label
              );
              const child = await this.consultation.buildValueCoded(
                data.label,
                data.value
              );
              return {
                ...host,
                child: {
                  ...child,
                },
              };
            });
          },
          type: FieldType.TT_MULTIPLE_YES_NO,
          options: (_: any, checked: Array<Option>) =>
            this.getTBSymptoms(checked),
        },
        {
          id: "tb_status",
          helpText: "TB Status",
          type: FieldType.TT_SELECT,
          // pre select yb suspected when the patient has TB symptoms
          preset: this.getFieldPreset(),
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.hasTBSymptoms(formData),
          unload: async (data: any) => {
            if (data.value === "TB Suspected") {
              this.TBSuspected = true;
            } else {
              this.TBSuspected = false;
            }
            this.tbStatusObs = this.consultation.buildValueText(
              "TB Status",
              data.value
            );
          },
          options: () => {
            return [
              { label: "TB NOT suspected", value: "TB NOT suspected" },
              { label: "TB Suspected", value: "TB Suspected" },
              {
                label: "Confirmed TB Not on treatment",
                value: "Confirmed TB Not on treatment",
              },
            ];
          },
        },
        {
          id: "routine_tb_therapy",
          helpText: "TB preventive therapy (TPT) history",
          validation: (data: any) => Validation.required(data),
          condition: () => !this.hasTBTherapyObs,
          unload: async (data: any) => {
            this.updateCompletedTPT(data);
            this.treatmentStatusObs = this.consultation.buildValueText(
              "Previous TB treatment history", data.value
            );
          },
          type: FieldType.TT_SELECT,
          options: () => {
            const hasDrug = (drugName: string) => 
              Object.values(this.lastDrugsReceived)
                .map((d: any) => d.drug.name.match(new RegExp(drugName, 'i')))
                .some(Boolean)
            const prescribedInh = hasDrug('inh')
            const prescribed3hp = hasDrug('Rifapentine')
            return [
              { 
                label: "Currently on IPT", 
                value: "Currently on IPT"
              },
              { 
                label: "Currently on 3HP", 
                value: "Currently on 3HP"
              },
              {
                label: "Complete course of 3HP in the past (3 months RFP+INH)",
                value: "Complete course of 3HP in the past (3 months RFP+INH)",
              },
              {
                label:
                  "Complete course of IPT in the past (min. 6 months of INH)",
                value:
                  "Complete course of IPT in the past (min. 6 months of INH)",
              },
              {
                label: "Aborted course of 3HP or IPT in the past",
                value: "Aborted course of 3HP or IPT in the past",
              },
              {
                label: "Never taken IPT or 3HP",
                value: "Never taken IPT or 3HP",
                disabled: (prescribedInh || prescribed3hp)
              },
            ];
          },
        },
        {
          id: "allergic_to_sulphur",
          helpText: "Allergic to Cotrimoxazole",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          unload: async (data: any) => {
            this.allergicToSulphur = data.value.match(/yes/i)
            this.sulphurObs = this.consultation.buildValueCoded(
              "Allergic to sulphur",
              data.value
            );
          },
          options: () => {
            return [...this.getYesNo(), { label: "Unknown", value: "Unknown" }];
          },
        },
        ...this.getAdherenceFields(this.askAdherence),
        {
          id: "refer_to_clinician",
          helpText: "Refer to clinician",
          condition: () => UserService.isNurse(),
          validation: (data: any) => Validation.required(data),
          unload: async (data: any) => {
            this.referObs = this.consultation.buildValueCoded(
              "Refer to clinician",
              data.value
            );
          },
          type: FieldType.TT_SELECT,
          options: () => this.getYesNo(),
        },
        {
          id: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          onload: (context: any) => {
            this.prescriptionContext = context;
          },
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disablePrescriptions(listData, value);
          },
          config: {
            footerBtns: [
              {
                name: "Update allergic to CPT",
                onClickComponentEvents: {
                  refreshOptions: (btnEvent: FooterBtnEvent, options: Option[]): Option[] => {
                    this.allergicToSulphur = btnEvent.btnOutput === 'Allergic'
                    return this.runAppendOptionParams(options)
                  }
                },
                onClick: () => {
                  return infoActionSheet(
                    "Allergic to Cotrimoxazole update",
                    `Is the patient allergic to cotrimoxazole.`,
                    "",
                    [
                      { name: "Allergic", slot: "start", color: "success" },
                      { name: "NOT Allergic", slot: "end" },
                    ]
                  )
                }
              }
            ]
          },
          options: (_: any, c: Array<Option>, cd: any, l: any) => {
            return !isEmpty(l) ? l :  this.getPrescriptionFields()
          }
        }
      ]
    },
  },
});
</script>