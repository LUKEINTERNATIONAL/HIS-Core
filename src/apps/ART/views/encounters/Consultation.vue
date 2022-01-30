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
import { generateDateFields, EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import table from "@/components/DataViews/tables/ReportDataTable"
import { PatientTypeService } from "../../services/patient_type_service";

export default defineComponent({
  mixins: [AdherenceMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    weightTrail: [] as any,
    isDrugRefillPatient: false as boolean,
    weightLossPercentageNum: 0 as number,
    lostTenPercentBodyWeight: false as boolean,
    CxCaEnabled: false as boolean,
    CxCaStartAge: -1 as number,
    CxCaMaxAge: -1 as number,
    DueForCxCa: false as boolean,
    currentlyPregnant: false as boolean,
    patientHitMenopause: false as boolean,
    hasPregnancyObsToday: false as boolean,
    autoSelect3HP: false as boolean,
    labOrderFieldContext: {} as any,
    consultation: {} as any,
    completed3HP: false as boolean,
    hasTbHistoryObs: false,
    allergicToSulphur: false,
    TBSuspected: false,
    presentedTBSymptoms: false,
    askAdherence: false as boolean,
    lastDrugsReceived: [] as any,
    sideEffectsHistory: {} as any,
    onPermanentFPMethods: false,
    guardianVisit: false,
    reasonForDecliningTPTObs: {} as any,
    malawiSideEffectReasonObs: [] as any,
    otherSideEffectReasonObs: [] as any,
  }),
  watch: {
    ready: {
      async handler(value: boolean) {
        if (value) {
          this.consultation = new ConsultationService(this.patientID, this.providerID)
          await this.initAdherence(this.patient, this.providerID);
          await this.guardianOnlyVisit();

          this.isDrugRefillPatient = await PatientTypeService.isDrugRefillPatient(this.patientID)

          this.sideEffectsHistory = await this.consultation.getDrugSideEffects()

          this.hasTbHistoryObs = await this.consultation.hasTreatmentHistoryObs()

          this.CxCaEnabled = await ART_PROP.cervicalCancerScreeningEnabled()

          this.weightTrail = await this.patient.getWeightHistory()

          this.weightLossPercentageNum = this.patient.getWeightLossPercentageFromTrail(this.weightTrail)

          this.lostTenPercentBodyWeight = this.weightLossPercentageNum >= 10

          if (this.CxCaEnabled) {
            const { start, end } = await ART_PROP.cervicalCancerScreeningAgeBounds()
            this.CxCaMaxAge = end
            this.CxCaStartAge = start
            this.DueForCxCa = await this.consultation.clientDueForCxCa()
          }

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
    async onFinish(_: any, computedData: any) {
      const encounter = await this.consultation.createEncounter();  

      if (!encounter) return toastWarning("Unable to create encounter");

      const computedObs = await this.resolveObs(computedData)

      const secondaryObs = (await Promise.all([
        ...this.malawiSideEffectReasonObs,
        ...this.otherSideEffectReasonObs,
        this.reasonForDecliningTPTObs
      ])).filter((d) => !isEmpty(d))

      const savedObs = await this.consultation.saveObservationList([
        ...computedObs, ...secondaryObs
      ])

      if (this.askAdherence && !this.isNonePatientClient()) await this.saveAdherence();

      if (!savedObs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    async checkIfWeightLossIsControlled(val: any) {
      if (this.lostTenPercentBodyWeight
        && `${val.label}`.match(/malnutrition/i)
        && `${val.value}`.match(/no/i)) {
        const action = await infoActionSheet(
          'Recommendation',
          `Patient's weight has dropped by ${this.weightLossPercentageNum}% , is this controlled weight loss??`,
          'Please verify',
          [
            { name: 'Confirm weight loss', slot: 'start', color: 'success'},
            { name: 'Confirm controlled', slot: 'end', color: 'primary'}
          ]
        )
        val.value = action === 'Confirm weight loss' ? 'Yes' : 'No'
      }
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
    canScreenCxCa() {
      const age = this.patient.getAge()
      return this.patient.isFemale() 
        && this.DueForCxCa
        && this.CxCaEnabled 
        && age >= this.CxCaStartAge && age <= this.CxCaMaxAge
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
    buildMedicationOrders(options: Option[]) {
      return this.inArray(options, o => o.label === "NONE OF THE ABOVE")
        ? this.consultation.buildValueCoded('Prescribe drugs', 'No')
        : options.map( o => this.consultation.buildValueCoded(
          'Medication orders', o.label
        ))
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
    async buildSideEffectObs(data: Option[], attr: 'malawiSideEffectReasonObs' | 'otherSideEffectReasonObs'): Promise<boolean> {
      const sideEffectReasons  = await this.getSideEffectsReasons(data)

      this[attr] = [] //Clear this incase side effects no longer exist
  
      if (sideEffectReasons === undefined) return false

      if (sideEffectReasons != -1) {
        const drugInducedConcept = ConceptService.getCachedConceptID('Drug induced', true)
        const isOtherReason = (reason: string) => `${reason}`.match(/other|drug/i) ? true : false
        this[attr] = sideEffectReasons.map((r: any) => ({
          'concept_id': drugInducedConcept,
          'value_coded': ConceptService.getCachedConceptID(r.label, true),
          'value_text': isOtherReason(r.reason) ? 'Past medication history' : null,
          'value_drug': !isOtherReason(r.reason) ? r.reason : null //Reason is drug ID number if caused by specific drug
        }))
      }
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
    getReasonsForNoCxcaOptions() {
      return ConceptService.getConceptsByCategory("reason_for_no_cxca")
        .map((c: any) => ({
          label: c.name,
          value: c.name,
          other: {
            c
          }
        }))
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
    medicationOrderOptions(d: any, prechecked=[] as Option[]): Option[] {
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
        this.toOption('ARVs', {
          appendOptionParams: () => ({ 
            isChecked: autoSelect3HP && !this.TBSuspected
          })
        }),
        this.toOption('CPT', {
          appendOptionParams: () => {
            return this.allergicToSulphur 
              ? disableOption('Allergic to CPT')
              : { disabled: false }
          }
        }),
        this.toOption('3HP (RFP + INH)', {
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
        }),
        this.toOption('IPT', {
          appendOptionParams: () => {
            if (completed3HP) return disableOption('Completed 3HP')
            if (this.TBSuspected) return disableOption('TB Suspect')
            return { isChecked : autoSelect3HP }
          }
        }),
        this.toOption('NONE OF THE ABOVE')
      ], prechecked)
    },
    isNonePatientClient() {
      return this.guardianVisit || this.isDrugRefillPatient
    },
    getFields(): any {
      return [
        {
          id: "guardina_prescription",
          proxyID: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option[]) => this.buildMedicationOrders(v),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disablePrescriptions(listData, value);
          },
          options: (formData: any, c: Array<Option>, cd: any, l: any) => {
            return !isEmpty(l) ? l : this.medicationOrderOptions(formData)
          },
          condition: () => this.isNonePatientClient(),
          exitsForm: () => true
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
          condition: () => !this.hasPregnancyObsToday && this.pregnancyEligible(),
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          computedValue: (v: Option[]) => v.map(d => 
            this.consultation.buildValueCoded(d.other.concept, d.value)
          ),  
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
            const values = this.weightTrail;
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
          options: () => this.mapStrToOptions([
            "Patient is on Tubal ligation method"
          ])
        },
        {
          id: "current_fp_methods",
          helpText: "What method are you currently on?",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          computedValue: (v: Option[]) => v.map(d =>
            this.consultation.buildValueCoded('Family planning method', d.value)
          ),
          condition: (formData: any) => this.showCurrentContraceptionMethods(formData),
          options: (_: any, checked: Array<Option>) =>this.getFPMethods([], checked),
        },
        {
          id: "fp_methods",
          helpText: "What method are you providing today?",
          type: FieldType.TT_MULTIPLE_SELECT,
          condition: (formData: any) => this.showNewContraceptionMethods(formData),
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          computedValue: (v: Option[]) => v.map((d: Option) =>
            this.consultation.buildValueCoded('Family planning, action to take', d.value)
          ),
          options: (_: any, checked: Array<Option>) => this.getFPMethods([], checked)
        },
        {
          id: "reason_for_no_fpm",
          helpText: "Main reason for not using family planning methods",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.declinedFPM(formData),
          computedValue: (v: Option) => this.consultation.buildValueText(
            "Why does the woman not use birth control", v.value
          ),
          options: () => this.mapStrToOptions([
            "Not Sexually active",
            "Patient want to get pregnant",
            "Not needed for medical reasons",
            "At risk of unplanned pregnancy",
            "Menopause"
          ])
        },
        {
          id: "specific_reason_for_no_fpm",
          helpText: "Specific reason for not using family planning methods",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option) => this.consultation.buildValueText(
            "Reason for not using contraceptives", v.value
          ),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          options: () => this.mapStrToOptions([
            "Following wishes of spouse",
            "Religious reasons",
            "Afraid of side effects",
            "Never though about it",
            "Indifferent (does not mind getting pregnant)"
          ])
        },
        {
          id: "offer_cxca",
          helpText: "Refer client for CxCa screening",
          type: FieldType.TT_SELECT,
          validation: (v: Option) => Validation.required(v),
          condition: () => this.canScreenCxCa(),
          computedValue: (v: Option) => this.consultation.buildValueCoded(
            'Offer CxCa', v.value
          ),
          options: () => this.yesNoOptions()
        },
        {
          id: "reason_for_no_cxca",
          helpText: "Reason for NOT offering CxCa",
          type: FieldType.TT_SELECT,
          validation: (v: Option) => Validation.required(v),
          condition: (f: any) => f.offer_cxca.value === 'No',
          computedValue: (v: Option) => this.consultation.buildValueCoded(
            "Reason for NOT offering CxCa", v.value
          ), 
          options: () => this.getReasonsForNoCxcaOptions(),
        },
        ...generateDateFields({
          id: 'previous_cxca_test_date',
          helpText: 'Previous CxCa test',
          required: true,
          minDate: () => this.patient.getBirthdate(),
          maxDate: () => ConsultationService.getSessionDate(),
          condition: (f: any) => f.reason_for_no_cxca.value === 'Not due for screening',
          computeValue: (date: string, isEstimate: boolean) => {
            if (isEstimate) {
              return this.consultation.buildValueDateEstimated(
                'CxCa test date', date
              )
            } else {
              return this.consultation.buildValueDate(
                'CxCa test date', date
              )
            }
          },
          estimation: {
            allowUnknown: true,
            estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
          }
        }),
        {
          id: "offer_contraceptives",
          helpText: "Offer contraceptives",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          computedValue: (v: any) => this.consultation.buildValueCoded(
            "Family planning, action to take", v.value
          ),
          options: () => [
            { label: "Accepted", value: "Yes" },
            { label: "Declined", value: "No" },
            { label: "Discuss with spouse", value: "Discuss with spouse" },
          ]
        },
        {
          id: "offered_intervention",
          helpText: "Offered intervention",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => formData.offer_contraceptives.value === "Accepted",
          computedValue: (v: Option[]) => v.map( d =>
            this.consultation.buildValueCoded(d.label, d.value)
          ),
          options: (_: any, checked: Array<Option>) => this.getFPMethods(["NONE"], checked),
        },
        {
          id: 'previous_side_effects',
          helpText: 'Side effects / Contraindications history',
          type: FieldType.TT_DATA_TABLE,
          config: {
            columns: () => [
              [
                table.thTxt('Date'),
                table.thTxt('Condition'),
                table.thTxt('Drug induced'),
                table.thTxt('Drug')
              ]
            ],
            rows: () => {
              return Object.keys(this.sideEffectsHistory)
              .map((k: string) =>
                Object.values(this.sideEffectsHistory[k]).map((d: any) => [
                  table.tdDate(k),
                  table.td(d.name),
                  table.td(d.drug_induced ? 'Yes' : 'No'),
                  table.td(d.drug)
              ]))
              .reduce((accum, cur) => accum.concat(cur), [])
            }
          }
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
          computedValue: (v: Option[]) => v.map(async (d) => ({
            ...(await this.consultation.buildValueCoded('Malawi ART side effects', d.label)),
            child: (await this.consultation.buildValueCoded(d.label, d.value)) 
          })),
          beforeNext: (data: Option[]) => this.buildSideEffectObs(data, 'malawiSideEffectReasonObs'),
          options: (_: any, checked: Array<Option>) => this.getContraindications(checked)
        },
        {
          id: "other_side_effects",
          helpText: "Other Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          onValue: async (val: any) => {
            await this.checkIfWeightLossIsControlled(val)
            return true
          },
          condition: (formData: any) => this.showOtherSideEffects(formData),
          onConditionFalse: () => this.otherSideEffectReasonObs = [],
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          computedValue: (v: Option[]) => {
            return v.filter(d => d.label != 'Other (Specify)')
              .map(async (d) => ({
              ...(await this.consultation.buildValueCoded('Other side effect', d.label)),
              child: (await this.consultation.buildValueCoded(d.label, d.value))
            }))
          },
          beforeNext: (data: Option[]) => this.buildSideEffectObs(data, 'otherSideEffectReasonObs'),
          options: (_: any, checked: Array<Option>) => this.getOtherContraindications(checked),
        },
        {
          id: 'other_side_effect_specify',
          helpText: "Other Contraindications / Side effects (specify)",
          type: FieldType.TT_NOTE,
          computedValue: async (v: Option) => ({
            ...(await this.consultation.buildValueCoded('Other side effect', 'Other (Specify)')),
            child: (await this.consultation.buildValueText('Other (Specify)', v.value ))
          }),
          condition: (f: any) => this.inArray(f.other_side_effects, d => d.label === 'Other (Specify)'),
          validation: (v: Option) => Validation.required(v)
        },
        {
          id: "on_tb_treatment",
          helpText: "On TB Treatment?",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (data: any) => {
            this.TBSuspected = data.value === "Yes"
            return this.consultation.buildValueCoded(
              "TB treatment", data.value
            )
          },
          options: () => this.yesNoOptions()
        },
        {
          id: "tb_side_effects",
          helpText: "TB Associated symptoms",
          type: FieldType.TT_MULTIPLE_YES_NO,
          onValue: async (val: any) => {
            await this.checkIfWeightLossIsControlled(val)
            return true
          },
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data)
          ]), 
          condition: (formData: any) => formData.on_tb_treatment.value.match(/no/i),
          options: (_: any, checked: Array<Option>) => this.getTBSymptoms(checked),
          computedValue: (vals: Option[]) => {
            this.presentedTBSymptoms = this.inArray(vals, d => d.value === "Yes")
            return vals.map(async (data: Option) => ({
              ...(await this.consultation.buildValueCoded("Routine TB Screening", data.label)),
              child: (await this.consultation.buildValueCoded(data.label, data.value))
            }))
          }
        },
        {
          id: "tb_status",
          helpText: "TB Status",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.hasTBSymptoms(formData),
          onConditionFalse: () => this.TBSuspected = false,
          defaultValue: () => 'TB Suspected',
          computedValue: (data: any) => {
            this.TBSuspected = data.value === "TB Suspected"
            return this.consultation.buildValueText(
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
          options: () => this.mapStrToOptions([
            "TB NOT suspected",
            "TB Suspected",
            "Confirmed TB Not on treatment",
          ])
        },
        {
          id: "routine_tb_therapy",
          helpText: "TB preventive therapy (TPT) history",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: () => !this.hasTbHistoryObs,
          computedValue: (data: any) => this.consultation.buildValueText(
            "Previous TB treatment history", data.value
          ),
          options: () => this.mapStrToOptions([
            "Currently on IPT", 
            "Currently on 3HP",
            "Complete course of 3HP in the past (3 months RFP+INH)",
            "Complete course of IPT in the past (min. 6 months of INH)",
            "Aborted course of 3HP or IPT in the past",
            "Never taken IPT or 3HP"
          ])
        },
        {
          id: "allergic_to_sulphur",
          helpText: "Allergic to Cotrimoxazole",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (data: any) => {
            this.allergicToSulphur = data.value.match(/yes/i)
            return this.consultation.buildValueCoded(
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
          computedValue: (data: any) => this.consultation.buildValueCoded(
            "Refer to clinician", data.value
          ),
          options: () => this.yesNoOptions(),
        },
        {
          id: "medication_to_prescribe",
          proxyID: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: Option) => Validation.required(data),
          computedValue: (v: Option[]) => this.buildMedicationOrders(v),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disablePrescriptions(listData, value);
          },
          options: (formData: any, c: Array<Option>, cd: any, currentOptions: any) => {
            return this.medicationOrderOptions(formData, currentOptions)
          },
          config: {
            footerBtns: [
              {
                name: "Update allergic to CPT",
                onClickComponentEvents: {
                  refreshOptions: (btnEvent: FooterBtnEvent, options: Option[], formData: any): Option[] => {
                    this.allergicToSulphur = btnEvent.btnOutput === 'Allergic'
                    return this.medicationOrderOptions(formData, options)
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
    }
  }
})
</script>