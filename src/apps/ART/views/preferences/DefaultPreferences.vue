<template>
    <ion-page> 
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true"
        > 
        </his-standard-form>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements";
import ART_PROP from "@/apps/ART/art_global_props"
import {ART_GLOBAL_PROP} from "@/apps/ART/art_global_props"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Field, Option } from '@/components/Forms/FieldInterface';
import { isEmpty } from "lodash"
import { GlobalPropertyService } from '@/services/global_property_service';
import { toastSuccess } from '@/utils/Alerts';
import { IonPage } from "@ionic/vue"

export default defineComponent({
	components: { HisStandardForm, IonPage },
	data: () => ({
		preference: '' as string,
		fields: [] as Field[]
	}),
	created() {
		this.preference = this.$route.name as string
		this.fields = [
			...this.getBPThresholdPreferences(),
			...this.getFilingNumberLimitPreferences(),
			...this.getAppointmentLimitPreferences(),
			...this.getHtnAgePreferences(),
			...this.getClinicDaysPreferences()
		]
	},
	methods: {
		isProp(prop: string) {
			return !this.preference || prop === this.preference
		},
		async onFinish(_: any, data: Record<string, any>) {
			for(const prop in data) {
				await GlobalPropertyService.set(prop, data[prop])
				toastSuccess('Property has been updated', 2000)
			}
			this.$router.back()
		},
		getBPThresholdPreferences() {
			const prop = 'bp_thresholds'
			return [
				{
					id: ART_GLOBAL_PROP.HTN_SYSTOLIC_THRESHOLD,
					helpText: 'Set systolic blood pressure',
					type: FieldType.TT_NUMBER,
					condition : () => this.isProp(prop),
					computedValue: (v: Option) => v.value,
					defaultValue: () => ART_PROP.systolicThreshold(),
					validation: (val: any) => Validation.required(val) 
				},
				{
					id: ART_GLOBAL_PROP.HTN_DIASTOLIC_THRESHOLD,
					helpText: 'Set diastolic blood pressure',
					type: FieldType.TT_NUMBER,
					condition : () => this.isProp(prop),
					computedValue: (v: Option) => v.value,
					defaultValue: () => ART_PROP.diastolicThreshold(),
					validation: (val: any) => Validation.required(val)
				}
			]
		},
		getFilingNumberLimitPreferences() {
			const prop = ART_GLOBAL_PROP.FILING_NUMBER_LIMIT
			return [
				{
					id: prop,
					helpText: "Enter Filing Number Limit",
					condition : () => this.isProp(prop),
					computedValue: (v: Option) => v.value, 
					defaultValue: () => ART_PROP.filingNumberLimit(),
					type: FieldType.TT_NUMBER,
					validation: (val: any) => Validation.required(val)
				}
			]
		},
		getAppointmentLimitPreferences() {
			const prop = ART_GLOBAL_PROP.APPOINTMENT_LIMIT
			return [
				{
					id: prop,
					helpText: "Enter Appointment Limit",
					type: FieldType.TT_NUMBER,
					computedValue: (v: Option) => v.value, 
					condition : () => this.isProp(prop),
					defaultValue: () => ART_PROP.appointmentLimit(),
					validation: (val: any) => Validation.required(val),
				}
			]
		},
		getHtnAgePreferences() {
			const prop = ART_GLOBAL_PROP.HTN_SCREENING_AGE_THRESHOLD
			return [
				{
					id: prop,
					type: FieldType.TT_NUMBER,
					helpText: "Enter HTN age Threshold",
					condition : () => this.isProp(prop),
					computedValue: (v: Option) => v.value,
					defaultValue: () => ART_PROP.htnAgeThreshold(),
					validation: (val: any) => Validation.required(val)
				}
			]
		},
		getClinicDaysPreferences() {
			const prop = 'clinic_days'
			const toStr = (v: Option[]) => v.map(d => d.value).join()
			const options = (values: string) => {
				const days = [
					"Sunday",
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday"
				]
				return days.map(d => ({
					label: d, 
					value: d,
					isChecked: !isEmpty(values) && values.search(d) >= 0
				}))
			}
			return [
				{
					id: ART_GLOBAL_PROP.ADULT_CLINIC_DAYS,
					helpText: "Clinic days (adults: 18 yrs and over)",
					type: FieldType.TT_MULTIPLE_SELECT,
					condition : () => this.isProp(prop),
					computedValue: (v: Option[]) => toStr(v), 
					validation: (val: any) => Validation.required(val),
					options: async () => options((await ART_PROP.adultClinicDays())),
				},
				{
					id: ART_GLOBAL_PROP.PEADS_CLINIC_DAYS,
					helpText: "Clinic days (children: Under 18 yrs)",
					type: FieldType.TT_MULTIPLE_SELECT,
					condition : () => this.isProp(prop),
					computedValue: (v: Option[]) => toStr(v),
					validation: (val: any) => Validation.required(val),
					options: async () => options((await ART_PROP.peadsClinicDays()))
				}
			]
		}
	}
})
</script>
