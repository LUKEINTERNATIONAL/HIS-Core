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
import { infoActionSheet, optionsActionSheet } from "@/utils/ActionSheets";
import SideEffectsModalVue from "@/components/DataViews/SideEffectsModal.vue";
import ART_PROP from "@/apps/ART/art_global_props";

export default defineComponent({
  mixins: [AdherenceMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    currentlyPregnant: false as boolean,
    patientHitMenopause: false as boolean,
    hasPregnancyObsToday: false as boolean,
    autoSelect3HP: false as boolean,
    labOrderFieldContext: {} as any,
    prescriptionContext: {} as any,
    consultation: {} as any,
    completed3HP: false as boolean,
    hasTbHistoryObs: false,
    allergicToSulphur: false,
    TBSuspected: false,
    presentedTBSymptoms: false,
    pregnancy: [] as any,
    currentFPM: [] as any,
    newFPM: [] as any,
    reasonForNoFPM: {} as any,
    specificReasonForNoFPM: {} as any,
    offerContraceptives: {} as any,
    tbObs: {} as any,
    tbSideEffectsObs: [] as any,
    tbStatusObs: {} as any,
    treatmentStatusObs: {} as any,
    sulphurObs: {} as any,
    referObs: {} as any,
    reasonForDecliningTPTObs: {} as any,
    otherSpecifySideEffect: {} as any,
    medicationObs: [] as any,
    malawiSideEffectObs: [] as any,
    otherSideEffectObs: [] as any,
    malawiSideEffectReasonObs: [] as any,
    otherSideEffectReasonObs: [] as any,
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
          this.consultation = new ConsultationService(this.patientID, this.providerID)
          await this.initAdherence(this.patient, this.providerID);
          await this.getSideEffectsHistory();
          await this.guardianOnlyVisit();

          this.hasTbHistoryObs = await this.consultation.hasTreatmentHistoryObs()

          if (this.patient.isChildBearing()) {
            this.hasPregnancyObsToday = await this.patient.hasPregnancyObsToday()
            this.currentlyPregnant = await this.patient.isPregnant()
          } 
          if (this.patient.isFemale()) {
            this.patientHitMenopause = await this.consultation.patientHitMenopause()
          }
          if (this.hasTbHistoryObs) {
            this.completed3HP = await this.consultation.patientCompleted3HP()
          } 
          this.autoSelect3HP = await ART_PROP.threeHPAutoSelectEnabled()
          this.askAdherence = this.adherence.receivedDrugsBefore();
          this.fields = this.getFields();
          this.onPermanentFPMethods = await this.consultation.getTLObs();
          this.lastDrugsReceived = await this.consultation.getPreviousDrugs();
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
        ...this.malawiSideEffectObs,
        ...this.otherSideEffectObs,
        ...this.malawiSideEffectReasonObs,
        ...this.otherSideEffectReasonObs,
        ...this.pregnancy,
        ...this.currentFPM,
        ...this.newFPM,
        this.reasonForNoFPM,
        this.specificReasonForNoFPM,
        this.offerContraceptives,
        this.tbObs,
        this.otherSpecifySideEffect,
        ...this.tbSideEffectsObs,
        this.tbStatusObs,
        this.treatmentStatusObs,
        this.sulphurObs,
        this.referObs,
        this.reasonForDecliningTPTObs,
        ...this.medicationObs
      ])

      const filtered = data.filter((d) => !isEmpty(d));

      const obs = await this.consultation.saveObservationList(filtered);

      if (this.askAdherence && !this.guardianVisit) await this.saveAdherence();

      if (!obs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
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
    pregnancyEligible() {
      return this.patient.isChildBearing() && !this.onPermanentFPMethods
    },
    showCurrentContraceptionMethods(formData: any) {
      return (this.pregnancyEligible()
        && !this.patientHitMenopause 
        && !this.isPregnant(formData))
    },
    showNewContraceptionMethods(formData: any) {
      return (
        this.pregnancyEligible() &&
        !this.patientHitMenopause &&
        !this.isPregnant(formData) &&
        !this.isOnTubalLigation(formData)
      )
    },
    isPregnant(formData: any) {
      try {
        return this.currentlyPregnant
          || this.inArray(formData.pregnant_breastfeeding, 
            p => p.label === 'Pregnant' && p.value === 'Yes'
          )
      } catch (e) {
        alert(e)
        return false
      }
    },
    isOnTubalLigation(formData: any) {
      return this.inArray(formData.current_fp_methods, d => d.value === "TUBAL LIGATION")
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
              "Medication orders", element.label
            )
          );
        }
        if (element.label === "NONE OF THE ABOVE" && element.isChecked) {
          prescribeDrugs = "No";
        }
      })
      this.medicationObs.push(
        this.consultation.buildValueCoded("Prescribe drugs", prescribeDrugs)
      );
    },
    declinedFPM(formData: any) {
      return this.inArray(formData.fp_methods, d => d.value === "NONE")
    },
    riskOfUnplannedPregnancy(formData: any) {
      return formData.reason_for_no_fpm.value === "At risk of unplanned pregnancy"
    },
    showOtherSideEffects(formData: any) {
      return this.inArray(formData.side_effects, d => d.label === "Other" && d.value === "Yes")
    },
    hasTBSymptoms(formData: any) {
      this.presentedTBSymptoms = this.inArray(formData.tb_side_effects, d => d.value === "Yes")
      return this.presentedTBSymptoms
    },
    async buildSideEffectObs(data: Option[], sideEffectType: 'malawiSideEffectObs' | 'otherSideEffectObs'): Promise<boolean> {
      const sideEffectReasons  = await this.getSideEffectsReasons(data)
      const typeRefs: any = {
        'malawiSideEffectObs': {
          conceptRef: 'Malawi ART side effects',
          reasonRef: 'malawiSideEffectReasonObs' 
        } ,
        'otherSideEffectObs': {
          conceptRef: 'Other side effect',
          reasonRef: 'otherSideEffectReasonObs'
        }
      }
      const attr: any = typeRefs[sideEffectType]
     
      this[attr.reasonRef as 'malawiSideEffectReasonObs' | 'otherSideEffectReasonObs'] = [] //Clear this incase side effects no longer exist
  
      if (sideEffectReasons === undefined) return false

      if (sideEffectReasons != -1) {
        const drugInducedConcept = ConceptService.getCachedConceptID('Drug induced')
        const isOtherReason = (reason: string) => `${reason}`.match(/other|drug/i) ? true : false
        this[attr.reasonRef as 'malawiSideEffectReasonObs' 
          | 'otherSideEffectReasonObs'] = sideEffectReasons.map(
          (r: any) => ({
            'concept_id': drugInducedConcept,
            'value_coded': ConceptService.getCachedConceptID(r.label),
            'value_text': isOtherReason(r.reason) ? 'Past medication history' : null,
            'value_drug': !isOtherReason(r.reason) ? r.reason : null //Reason is drug ID number if caused by specific drug
          }))
      }
      this[sideEffectType] = await data.filter(d => d.label != 'Other (Specify)')
        .map(async (d) => {
          const host = await this.consultation.buildValueCoded(
            attr.conceptRef, d.label
          )
          const child = await this.consultation.buildValueCoded(d.label, d.value)
          return { ...host, child: { ...child } }
        })
      return true
    },
    async getSideEffectsReasons(sideEffects: Option[]) {
      const allYes = sideEffects.filter(s => !(`${s.label}`.match(/other/i)) && s.value==='Yes')
      if (allYes.length > 0) {
        const modal = await modalController.create({
          component: SideEffectsModalVue,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: { sideEffects: allYes, drugs: this.lastDrugsReceived },
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
      )
      return filtered.map((method: any) => ({
        label: method,
        value: method,
        isChecked: preChecked.map((i) => i.label).includes(method),
      }))
    },
    getOptions(options: string[], preValues: Array<Option>) {
      return options.map((data: any) => {
        const preValue = find(preValues, { label: data });
        return {
          label: data,
          value: preValue ? preValue.value : "",
          other: {
            values: this.yesNoOptions(),
          },
        };
      });
    },
    getContraindications(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "contraindication", true
      ).map((data) => data.name);
      return this.getOptions([...contraIndications, "Other"], preValues);
    },
    getOtherContraindications(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "side_effect", true
      ).map((data) => data.name);
      /**
       * HACK ALERT!!!
       * Dont want to show Other (Specify) as a last element
       */
      const lastElement = contraIndications.pop()
      return this.getOptions([...contraIndications, "Other (Specify)", `${lastElement}`], preValues)
    },
    getTBSymptoms(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "tb_symptom", true
      ).map((data) => data.name)
      return this.getOptions([...contraIndications], preValues);
    },
    runAppendOptionParams(options: Option[], prechecked: Option[]) {
      const checkedOptions = prechecked.filter(o => o.isChecked).map(o => o.label)
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
              option.isChecked = checkedOptions.includes(o.label)
            }
            return { ...option, ...appendedOptions}
          }
        }
        return o
      })
    },
    getPrescriptionFields(d: any, prechecked=[] as Option[]): Option[] {
      const completed3HP = !this.completed3HP 
        ? d.routine_tb_therapy 
        && d.routine_tb_therapy.value.match(/complete/i) ? true : false
        : true
      const autoSelect3HP = this.autoSelect3HP && !completed3HP
      const disableOption = (text: string) => ({
        disabled: true,
        isChecked: false,
        description: {
          color: "danger",
          show: "always",
          text
        }
      })
      return this.runAppendOptionParams([
        {
          label: "ARVs", 
          value: "ARVs",
          other: {
            appendOptionParams: () => ({ isChecked: autoSelect3HP })
          }
        },
        {
          label: "CPT", 
          value: "CPT",
          other: {
            appendOptionParams: () => {
              return this.allergicToSulphur 
                ? disableOption('Allergic to CPT')
                : { disabled: false }
            }
          }
        },
        { 
          label: "3HP (RFP + INH)", 
          value: "3HP (RFP + INH)",
          other: {
            onEvent: async (isChecked: boolean) =>  {
              if (!isChecked) {
                const modal = await optionsActionSheet(
                  'Reasons for declining TPT', 
                  '',
                  [
                    'Patient declined',
                    'Side-effects (previous or current)',
                    'Stock-out',
                    'Starting TB treatment',
                    'Other'
                  ],
                  [
                    { name : 'Done', slot: 'start', role: 'action'}
                  ]
                )
                this.reasonForDecliningTPTObs = this.consultation.buildValueText(
                  'Other reason for not seeking services', modal.selection
                )
              } else {
                this.reasonForDecliningTPTObs = {}
              }
            },
            appendOptionParams: () => { 
              if (completed3HP) return disableOption('Completed 3HP')

              if (this.TBSuspected) return disableOption('TB Suspect')

              return { isChecked : autoSelect3HP }
            }
          }
        },
        {
          label: "IPT", 
          value: "IPT", 
          other: {
            appendOptionParams: () => {
              if (completed3HP) return disableOption('Completed 3HP')

              if (this.TBSuspected) return disableOption('TB Suspect')

              return { isChecked : autoSelect3HP }
            }
          }
        },
        {
          label: "NONE OF THE ABOVE", 
          value: "NONE OF THE ABOVE" 
        }
      ], prechecked)
    },
    getFields(): any {
      return [
        {
          id: "guardina_prescription",
          proxyID: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disablePrescriptions(listData, value);
          },
          options: (formData: any, c: Array<Option>, cd: any, l: any) => {
            return !isEmpty(l) ? l : this.getPrescriptionFields(formData)
          },
          unload: (d: any, s: any, formData: any) => this.onFinish(formData),
          condition: () => this.guardianVisit
        },
        {
          id: "patient_lab_orders",
          helpText: "Lab orders",
          type: FieldType.TT_LAB_ORDERS,
          unload: () => this.checkVLReminder(),
          onload: (fieldContext: any) =>  this.labOrderFieldContext = fieldContext,
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
          onConditionFalse: () => this.pregnancy = [],
          condition: () => !this.hasPregnancyObsToday && this.pregnancyEligible(),
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          unload: (data: any) => {
            if (data) {
              this.pregnancy = data.map((data: Option) =>
                this.consultation.buildValueCoded(
                  data.other.concept, data.value
                )
              )
            }
          },
          options: (formData: any) => {
            const options = [
              {
                label: "Pregnant",
                value: "",
                other: {
                  values: this.yesNoOptions(),
                  concept: "Is patient pregnant",
                },
              },
              {
                label: "Breastfeeding",
                value: "",
                other: {
                  values: this.yesNoOptions(),
                  concept: "Is patient breast feeding",
                },
              },
            ]
            return formData.pregnant_breastfeeding 
              ? formData.pregnant_breastfeeding
              : options
          }
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
          type: FieldType.TT_TEXT_BANNER,
          condition: () => this.onPermanentFPMethods,
          options: () => [
            {
              label: "Patient is on Tubal ligation method",
              value: "Patient is on Tubal ligation method"
            }
          ]
        },
        {
          id: "current_fp_methods",
          helpText: "What method are you currently on?",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          unload: (data: any) => {
            this.currentFPM = data.map((data: Option) => {
              this.consultation.buildValueCoded('Family planning method', data.value)
            })
          },
          onConditionFalse: () => this.currentFPM = [],
          condition: (formData: any) => this.showCurrentContraceptionMethods(formData),
          options: (_: any, checked: Array<Option>) =>this.getFPMethods([], checked),
        },
        {
          id: "fp_methods",
          helpText: "What method are you providing today?",
          type: FieldType.TT_MULTIPLE_SELECT,
          onConditionFalse: () => this.newFPM = [],
          condition: (formData: any) => this.showNewContraceptionMethods(formData),
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          unload: (data: any) => {
            this.newFPM = data.map((data: Option) =>
              this.consultation.buildValueCoded('Family planning, action to take', data.value)
            )
          },
          options: (_: any, checked: Array<Option>) => this.getFPMethods([], checked)
        },
        {
          id: "reason_for_no_fpm",
          helpText: "Main reason for not using family planning methods",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.declinedFPM(formData),
          onConditionFalse: () => this.reasonForNoFPM = {},
          unload: (data: any) => {
            this.reasonForNoFPM = this.consultation.buildValueText(
              "Why does the woman not use birth control", data.value
            )
          },
          options: () => [
            { 
              label: "Not Sexually active", 
              value: "Not Sexually active" 
            },
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
            {
              label: "Menopause",
              value: "Menopause"
            }
          ]
        },
        {
          id: "specific_reason_for_no_fpm",
          helpText: "Specific reason for not using family planning methods",
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          onConditionFalse: () => this.specificReasonForNoFPM = {},
          unload: (data: any) => {
            this.specificReasonForNoFPM = this.consultation.buildValueText(
              "Reason for not using contraceptives", data.value
            )
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
          type: FieldType.TT_SELECT,
          //show when previous one has a value
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          onConditionFalse: () => this.offerContraceptives = {},
          unload: (data: any) => {
            this.offerContraceptives = this.consultation.buildValueCoded(
              "Family planning, action to take", data.value
            )
          },
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
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => formData.offer_contraceptives.value === "Accepted",
          onConditionFalse: () => this.newFPM = [],
          unload: (data: any) => {
            this.newFPM = data.map((data: Option) =>
              this.consultation.buildValueCoded(data.label, data.value)
            )
          },
          options: (_: any, checked: Array<Option>) => this.getFPMethods(["NONE"], checked),
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
          helpText: "Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          beforeNext: (data: Option[]) => this.buildSideEffectObs(data, 'malawiSideEffectObs'),
          options: (_: any, checked: Array<Option>) => this.getContraindications(checked)
        },
        {
          id: "other_side_effects",
          helpText: "Other Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          condition: (formData: any) => this.showOtherSideEffects(formData),
          onConditionFalse: () => {
            this.otherSideEffectReasonObs = []
            this.otherSideEffectObs = []
          },
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          beforeNext: (data: Option[]) => this.buildSideEffectObs(data, 'otherSideEffectObs'),
          options: (_: any, checked: Array<Option>) => this.getOtherContraindications(checked),
        },
        {
          id: 'other_side_effect_specify',
          helpText: "Other Contraindications / Side effects (specify)",
          type: FieldType.TT_TEXT,
          unload: (v: Option) => {
            this.otherSpecifySideEffect = this.consultation.buildValueText(
              'Other (Specify)', v.value 
            )
          },
          onConditionFalse: () => this.otherSpecifySideEffect = {},
          condition: (f: any) => this.inArray(f.other_side_effects, d => d.label === 'Other (Specify)'),
          validation: (v: Option) => Validation.required(v)
        },
        {
          id: "on_tb_treatment",
          helpText: "On TB Treatment?",
          validation: (data: any) => Validation.required(data),
          type: FieldType.TT_SELECT,
          unload: async (data: any) => {
            this.TBSuspected = data.value === "Yes"
            this.tbObs = this.consultation.buildValueCoded(
              data.label, data.value
            )
          },
          options: () => this.yesNoOptions()
        },
        {
          id: "tb_side_effects",
          helpText: "TB Associated symptoms",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
          ]),
          onConditionFalse: () => this.tbSideEffectsObs = [],
          condition: (formData: any) => formData.on_tb_treatment.value.match(/no/i),
          unload: async (vals: Option[]) => {
            this.presentedTBSymptoms = this.inArray(vals, d => d.value === "Yes")
            this.tbSideEffectsObs = await vals.map(async (data: Option) => {
              const host = await this.consultation.buildValueCoded(
                "Routine TB Screening", data.label
              );
              const child = await this.consultation.buildValueCoded(
                data.label, data.value
              )
              return { ...host, child: { ...child } }
            })
          },
          options: (_: any, checked: Array<Option>) => this.getTBSymptoms(checked)
        },
        {
          id: "tb_status",
          helpText: "TB Status",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.hasTBSymptoms(formData),
          onConditionFalse: () => {
            this.TBSuspected = false
            this.tbStatusObs = {}
          },
          defaultValue: () => 'TB Suspected',
          unload: (data: any) => {
            this.TBSuspected = data.value === "TB Suspected"
            this.tbStatusObs = this.consultation.buildValueText(
              "TB Status", data.value
            )
          },
          beforeNext: async (data: Option) => {
            if (`${data.value}`.match(/suspected/i)) {
              const action = await infoActionSheet(
                "Lab Order",
                "The patient is a TB suspect. Do you want to take lab orders?",
                "",
                [
                  { name: "Order now", slot: "start", color: "success" },
                  { name: "NOT now", slot: "end", color: "danger" },
                ]
              )
              if (action === 'Order now') this.labOrderFieldContext.launchOrderSelection([
                'TB Microscopic Exam', 
                'GeneXpert', 
                'Culture & Sensitivity', 
                'TB Tests'
              ])
            }
            return true
          },
          options: () => [
            { 
              label: "TB NOT suspected", 
              value: "TB NOT suspected"
            },
            { 
              label: "TB Suspected", 
              value: "TB Suspected" 
            },
            {
              label: "Confirmed TB Not on treatment",
              value: "Confirmed TB Not on treatment",
            }
          ]
        },
        {
          id: "routine_tb_therapy",
          helpText: "TB preventive therapy (TPT) history",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: () => !this.hasTbHistoryObs,
          onConditionFalse: () => this.treatmentStatusObs = {},
          unload: (data: any) => {
            this.treatmentStatusObs = this.consultation.buildValueText(
              "Previous TB treatment history", data.value
            )
          },
          options: () => [
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
            }
          ]
        },
        {
          id: "allergic_to_sulphur",
          helpText: "Allergic to Cotrimoxazole",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          unload: (data: any) => {
            this.allergicToSulphur = data.value.match(/yes/i)
            this.sulphurObs = this.consultation.buildValueCoded(
              "Allergic to sulphur", data.value
            )
          },
          options: () => this.yesNoUnknownOptions()
        },
        ...this.getAdherenceFields(this.askAdherence),
        {
          id: "refer_to_clinician",
          helpText: "Refer to clinician",
          type: FieldType.TT_SELECT,
          condition: () => UserService.isNurse(),
          validation: (data: any) => Validation.required(data),
          unload: (data: any) => {
            this.referObs = this.consultation.buildValueCoded(
              "Refer to clinician", data.value
            )
          },
          options: () => this.yesNoOptions(),
        },
        {
          id: "medication_to_prescribe",
          proxyID: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: Option) => Validation.required(data),
          onload: (context: any) => this.prescriptionContext = context,
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disablePrescriptions(listData, value);
          },
          options: (formData: any, c: Array<Option>, cd: any, currentOptions: any) => {
            return this.getPrescriptionFields(formData, currentOptions)
          },
          config: {
            footerBtns: [
              {
                name: "Update allergic to CPT",
                onClickComponentEvents: {
                  refreshOptions: (btnEvent: FooterBtnEvent, options: Option[], formData: any): Option[] => {
                    this.allergicToSulphur = btnEvent.btnOutput === 'Allergic'
                    return this.getPrescriptionFields(formData, options)
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
          }
        }
      ]
    },
  },
});
</script>