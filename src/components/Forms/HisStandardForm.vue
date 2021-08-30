<template>
  <ion-page>
    <ion-header> 
        <ion-toolbar>
            <ion-row> 
                <ion-col :size="toolbarInfo ? 7 : 12"> 
                    <label class='his-title'> {{title}} </label>
                </ion-col>
                <ion-col size="5" v-if="toolbarInfo"> 
                    <info-card :items="toolbarInfo"> </info-card>
                </ion-col>
            </ion-row>
        </ion-toolbar>
    </ion-header>
    <ion-content>
        <base-form
            v-if="fields.length >= 1"
            :fields="formFields"
            :next="isNext"
            :prev="isPrev"
            :clear="isClear"
            :index="skipToIndex"
            @onFinish="onFinish"
            @onClear="isClear=false"
            @onErrors="onErrors"
            @onState="onState"
        />
    </ion-content>
    <his-footer 
        :btns="footerBtns"
        :state="{index, field, totalFields, onNextRequired}">
    </his-footer>
  </ion-page>
</template>
<script lang="ts">
import BaseForm from "@/components/Forms/BaseForm.vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { Field, Option } from "./FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { defineComponent, PropType } from "vue";
import { IonPage, IonContent,IonRow, IonToolbar, IonCol, IonHeader } from "@ionic/vue";
import { alertConfirmation, toastWarning } from "@/utils/Alerts"
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface"
import { findIndex} from "lodash"
import { isEmpty } from "lodash"
import InfoCard from "@/components/DataViews/HisFormInfoCard.vue"
export default defineComponent({
    name: "HisStandardForm",
    components: { InfoCard, BaseForm, IonPage, IonContent, HisFooter, IonRow, IonToolbar, IonCol, IonHeader },
    props: {
        skipSummary: {
            type: Boolean,
            default: false
        },
        activeField: {
            type: String
        },
        fields: {
            type: Object as PropType<Field[]>,
            required: true
        },
        cancelDestinationPath: {
            type: String,
            required: false,
        }
    },
    data:()=>({
      index: -1,
      field: {} as Field,
      isNext: false,
      isPrev: false,
      isClear: false,
      totalFields: 0,
      skipToIndex: -1,
      onNextRequired: true,
      formFields: [] as Array<Field>,
      footerBtns: [] as Array<NavBtnInterface>
    }),
    computed: {
        title(): string {
            return !isEmpty(this.field) ? this.field.helpText : ''
        },
        toolbarInfo(): Array<Option> | undefined{
            if (!isEmpty(this.field) && this.field.config) {
                return this.field?.config?.toolbarInfo
            }
            return undefined
        }
    },
    watch: {
        fields: {
            handler(fields: Array<Field>) {
                if (!fields) return
                const summary = this.skipSummary ? [] : [this.getDefaultSummaryField()]
                this.formFields = [...fields, ...summary]
                this.totalFields = this.formFields.length
                this.footerBtns = [
                    this.cancel(),
                    ...this.getCustomFieldButtons(this.formFields),
                    this.clear(),
                    this.back(),
                    this.next(),
                    this.finish()
                ]
                this.changeIndex(this.activeField || '')
            },
            deep: true,
            immediate: true
        },
        activeField:
        {
            handler(field: string){ this.changeIndex(field) },
            immediate: true
        } 
    },
    methods: {
        onErrors(errors: Array<string>) {
            toastWarning(errors.join(', '), 3000)
        },
        changeIndex(fieldID: string) {
           const index = findIndex(this.formFields, { id: fieldID })
           if (index >= 0) {
               this.skipToIndex = index 
               this.$emit('onIndex')
           } 
        },
        onState({ field, index }: any){
            this.index = index
            this.field = field
            this.isNext = false
            this.isPrev = false
            this.skipToIndex = -1
            this.onNextRequired = field.requireNext != undefined ? field.requireNext : true
        },
        onFinish(formData: Record<string, any>, computedFormData: Record<string, any>) {
            this.$emit('onFinish', formData, computedFormData)
        },
        cancel(): NavBtnInterface {
            return {
                name: 'Cancel',
                size: 'large',
                color:'danger',
                visible: true,
                visibleOnStateChange: () => !this.isFieldConfigureBtnHidden('Cancel'),
                onClick: async () => {
                    const confirmation = await alertConfirmation('Are you sure you want to cancel?') 
                    const path = this.cancelDestinationPath
                    if (confirmation) {
                        !path ? this.$router.back() : this.$router.push({path})
                    }
                }
            }
        },
        clear(): NavBtnInterface {
            return {
                name: 'Clear',
                size: 'large',
                slot: 'end',
                color:'warning',
                visible: true,
                visibleOnStateChange: () => !this.isFieldConfigureBtnHidden('Clear'),
                onClick: async () => {
                    const confirmation = await alertConfirmation('Are you sure you want to clear field data?')
        
                    if (confirmation) this.isClear = true
                }
            }
        },
        back(): NavBtnInterface {
            return {
                name: 'Back',
                size: 'large',
                slot: 'end',
                color: 'primary',
                visible: false,
                visibleOnStateChange: () => {
                    if (!this.isFieldConfigureBtnHidden('Back')) {
                        return this.index > 0
                    }
                },
                onClick: () => {
                    this.isPrev = true
                }
            }
        },
        next(): NavBtnInterface {
            return {
                name: 'Next',
                size: 'large',
                slot: 'end',
                color: 'primary',
                visible: this.index +1 < this.totalFields,
                visibleOnStateChange: () => {
                    if (!this.isFieldConfigureBtnHidden('Next')) {
                        return this.index +1 < this.totalFields && this.onNextRequired
                    }
                    return false
                },
                onClick: async () => {
                    this.isNext = true
                }
            }
        },
        finish(): NavBtnInterface {
            return {
                name: 'Finish',
                size: 'large',
                slot: 'end',
                color: 'success',
                visible: false,
                visibleOnStateChange: () => {
                    if (!this.isFieldConfigureBtnHidden('Finish')) {
                        return this.index+1 >= this.totalFields
                    }
                    return false
                },
                onClick: async () => {
                    this.isNext = true
                }
            }
        },
        isFieldConfigureBtnHidden(btnName: string) {
            const hiddenBtns = this.field.config?.hiddenFooterBtns
            return hiddenBtns ? hiddenBtns.includes(btnName): false 
        },
        getCustomFieldButtons(fields: Array<Field>) {
            let buttons: Array<NavBtnInterface> = []
            fields.forEach((field: Field) => {
                if (field.config && field.config.footerBtns) {
                    buttons = [...buttons, ...field.config.footerBtns]
                }
            })
            return buttons
        },
        getDefaultSummaryField(): Field {
            return {
                id: '__form_summary__',
                helpText: 'Summary',
                type: FieldType.TT_SUMMARY,
                config: {
                    hiddenFooterBtns: [ 'Clear' ]
                },
                options: (formData: Record<string, any>, computedData: Record<string, any>) => {
                    const data: Array<Option> = [];
                    for(const ref in formData) {
                        const field = this.fields.filter((i: Field) => i.id === ref)[0]
                        const fdata = formData[ref]

                        if (!fdata || field.appearInSummary != undefined && !field.appearInSummary(formData))
                            continue

                        const values = Array.isArray(fdata) ? fdata : [fdata]

                        values.forEach(item => {
                            if (field.summaryMapValue) {
                                data.push(field.summaryMapValue(item, formData, computedData[ref]))
                                return
                            }
                            data.push({ label: field.helpText, value: item.label })
                        })
                    }
                    return data
                }
            }
        },
    }
})
</script>
<style scoped>
.tool-bar-medium-card {
    height: 100%;
    padding-right: 10px;
    text-align: right;
}
</style>