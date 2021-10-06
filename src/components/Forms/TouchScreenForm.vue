<template>
  <ion-page v-if="currentFields.length > 0">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ currentField.helpText }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <keep-alive>
        <component
          :key="currentField.id"
          :env="env"
          v-bind:is="currentField.type"
          :config="currentField.config"
          :options="currentField.options"
          :preset="currentField.preset"
          :clear="isClear"
          :fdata="formData"
          :cdata="computedFormData"
          :activationState="state"
          :onValue="currentField.onValue"
          :defaultValue="currentField.defaultValue"
          :onValueUpdate="currentField.onValueUpdate"
          @onValue="onFieldValue"
          @onClear="isClear = false"
          @onFieldActivated="onFieldActivated"
        />
      </keep-alive>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
          <ion-button
            v-for="(btn, index) in footerBtns"
            :key="index"
            :slot="btn.slot || 'start'"
            :class="btn.styleClass"
            @click="btn.onClick(formData, computedFormData)"
            :color="btn.color || 'primary'"
            :size="btn.size || 'large'"
            :disabled="onDisabledBtnState(btn, 'disabled', false)"
            v-show="onVisibleBtnState(btn, 'visible')"
          >
            {{ btn.name }}
          </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang='ts'>
import { defineComponent, PropType } from "vue";
import { Field, Option } from "./FieldInterface";
import { BaseFormComponents } from "@/components/Forms/BaseFormElements";
import { findIndex, isEmpty } from "lodash";
import { FieldType } from "@/components/Forms/BaseFormElements";
import {
  IonPage,
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonHeader,
  IonTitle,
} from "@ionic/vue";
import { alertConfirmation, toastWarning } from "@/utils/Alerts";

export default defineComponent({
  name: "BaseForm",
  components: {
    IonPage,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonHeader,
    IonTitle,
    ...BaseFormComponents,
  },
  emits: [
    'onFinish'
  ],
  props: {
    skipSumary: {
      type: Boolean,
      default: false,
    },
    activeField: {
      type: String,
    },
    fields: {
      type: Object as PropType<Field[]>,
      required: true,
    },
    cancelDestinationPath: {
      type: String,
    },
  },
  data: () => ({
    env: {} as any,
    isClear: false,
    currentIndex: 0,
    currentField: {} as Field,
    formData: {} as any,
    computedFormData: {} as any,
    footerBtns: [] as Array<any>,
    currentFields: [] as Array<Field>,
    state: "" as
      | "init"
      | "onload"
      | "unload"
      | "next"
      | "prev"
      | "onfinish"
      | "onValue"
      | "default"
  }),
  watch: {
    fields: {
      handler(fields: Array<Field>) {
        if (fields) {
          this.buildFormData(fields);
          let dataFields = fields;
          if (!this.skipSumary) {
            dataFields = [...dataFields, this.getDefaultSummaryField()];
          }
          this.currentFields = dataFields;
          this.onNext(); //look for a field to mount initially
        }
      },
      immediate: true,
      deep: true
    },
    activeField: {
      handler(field: string) {
        if (field) {
          const index = findIndex(this.currentFields, { id: field });
          if (this.isIndexValid(index)) {
            this.setActiveField(index);
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    getCancelBtn() {
      return {
        name: "Cancel",
        color: "danger",
        onClick: async () => {
          const confirmation = await alertConfirmation(
            "Are you sure you want to cancel?"
          );
          if (confirmation) {
            this.cancelDestinationPath
              ? this.$router.push(this.cancelDestinationPath)
              : this.$router.back();
          }
        },
      };
    },
    getClearBtn() {
      return {
        name: "Clear",
        color: "warning",
        slot: "end",
        onClick: async () => {
          const confirmation = await alertConfirmation(
            "Are you sure you want to clear field data?"
          );
          if (confirmation) this.isClear = true;
        },
      };
    },
    getBackBtn() {
      const visibleCondition = () => {
        if (this.currentFields.length === 1 
          || this.currentIndex <= 1) {
            return false;
          }
        return true;
      }
      return {
        name: "Back",
        slot: "end",
        state: {
          visible: {
            onload: () => visibleCondition(),
            default: () => visibleCondition()
          }
        },
        onClick: () => this.goBack()
      };
    },
    getNextBtn() {
      const visibleCondition = () => {
        if (this.currentIndex + 1 >= this.currentFields.length 
          || this.currentFields.length <= 1) {
          return false;
        }
        return true;
      }
      return {
        name: "Next",
        color: "success",
        slot: "end",
        state: {
          disabled: {
            onload(field: Field) {
              if ('requireNext' in field) {
                return !field.requireNext
              }
              return false
            }
          },
          visible: {
            default: () => visibleCondition(),
            onload: () => visibleCondition()
          }
        },
        onClick: () => this.goNext(),
      };
    },
    getFinishBtn() {
      const visibilityCondition = () => {
        return this.currentIndex+1 >= this.currentFields.length
      }
      return {
        name: "Finish",
        color: "success",
        slot: "end",
        state: {
          visible: {
            default:() => visibilityCondition(),
            onload: () => visibilityCondition()
          },
        },
        onClick: () => {
          this.$emit("onFinish", this.formData, this.computedFormData);
        },
      };
    },
    onVisibleBtnState(btn: any) {
      // Hide buttton if the current field configured it to be hidden
      try {
        if (this.currentField
            ?.config
            ?.hiddenFooterBtns
            .includes(btn.name)) {
          return false
        }
      }catch(e) { 
        //No hidden buttons i suppose
      }
      // Check for state observables in the button
      if (btn?.state?.visible) {
        if (this.state in btn.state.visible) {
          return btn.state.visible[this.state] (
            this.currentField, this.formData
          )
        }
        if ('default' in btn.state.visible) {
          return btn.state.visible['default'] (
            this.currentField, this.formData
          )
        }
      }
      return true
    },
    onDisabledBtnState(btn: any) {
      // Check for state observables in the button
      if (btn?.state?.disabled) {
        if (this.state in btn.state.disabled) {
          return btn.state.disabled[this.state] (
            this.currentField, this.formData
          )
        }
        if ('default' in btn.state.disabled) {
          return btn.state.disabled['default'] (
            this.currentField, this.formData
          )
        }
      }
      return false
    },
    getDefaultSummaryField(): Field {
      return {
        id: "__form_summary__",
        helpText: "Summary",
        type: FieldType.TT_SUMMARY,
        config: {
          hiddenFooterBtns: ["Clear"],
        },
        options: (
          formData: Record<string, any>,
          computedData: Record<string, any>
        ) => {
          const data: Array<Option> = [];
          for (const ref in formData) {
            const field = this.currentFields.filter(
              (i: Field) => i.id === ref
            )[0];
            const fdata = formData[ref];

            if (
              !fdata ||
              (field.appearInSummary != undefined &&
                !field.appearInSummary(formData))
            )
              continue;
            const values = Array.isArray(fdata) ? fdata : [fdata];

            values.forEach((item) => {
              if (field.summaryMapValue) {
                data.push(
                  field.summaryMapValue(item, formData, computedData[ref])
                );
                return;
              }
              data.push({ label: field.helpText, value: item.label });
            });
          }
          return data;
        },
      };
    },
    async goNext() {
      // Run field validations before goind next
      if (this.currentField.validation) {
        const value = this.formData[this.currentField.id];
        const errors = this.currentField.validation(
          value,
          this.formData,
          this.computedFormData
        );
        if (errors) {
          return toastWarning(errors.join(", "), 3500);
        }
      }
      // Run callback before proceeding to next field
      if (this.currentField.beforeNext) {
        const ok = await this.currentField.beforeNext();
        if (!ok) {
          return;
        }
      }
      this.onNext();
    },
    async goBack() {
      for (let i = this.currentIndex; i >= 0; --i) {
        const field = this.currentFields[i];
        if (!isEmpty(this.currentField) && this.currentField.id === field.id)
          continue;

        try {
          if (field.condition && !field.condition(this.formData)) {
            this.formData[field.id] = null;
            continue;
          }
        } catch (e) {
          continue;
        }
        await this.setActiveField(i, "prev");
        return
      }
    },
    onFieldActivated(fieldContext: any) {
      this.state = "onload";
      if (this.currentField.onload) this.currentField.onload(fieldContext);
    },
    onComputeValue() {
      if (this.currentField.computedValue) {
        const id = this.currentField.id;
        if (this.formData[id]) {
          this.computedFormData[id] = this.currentField.computedValue(
            this.formData[id],
            this.formData
          );
        } else {
          this.computedFormData[id] = null;
        }
      }
    },
    async onUnload(state = "") {
      this.state = "unload";
      if (!isEmpty(this.currentField) && this.currentField.unload) {
        const data = this.formData[this.currentField.id];
        if (data) {
          await this.currentField.unload(
            data,
            state,
            this.formData,
            this.computedFormData,
            this
          );
        }
      }
    },
    buildFormData(fields: Array<Field>): void {
      this.formData = {};
      fields.forEach((field) => (this.formData[field.id] = null));
    },
    isIndexValid(i: number): boolean {
      return i >= 0 && i <= this.currentFields.length;
    },
    async setActiveFieldValue(value: any) {
      this.state = "onValue";
      this.formData[this.currentField.id] = value;
    },
    async onNext() {
      const totalFields = this.currentFields.length;
      for (let i = this.currentIndex; i < totalFields; ++i) {
        const field = this.currentFields[i];

        if (!isEmpty(this.currentField) 
          && this.currentField.id === field.id)
          continue;

        try {
          if (field.condition && !field.condition(this.formData)) {
            this.formData[field.id] = null;
            continue;
          }
        } catch (e) {
          continue;
        }
        await this.setActiveField(i, "next");
        return;
      }
      this.onComputeValue();
      this.state = "onfinish";
    },
    async setActiveField(index: number, state = "" as "init" | "next" | "prev") {
      await this.onUnload(state);
      // Do any data conversion process if applicable for the current Field
      this.onComputeValue();
      this.state = state;
      this.currentIndex = index;
      this.currentField = this.currentFields[this.currentIndex];
      // create new instance of footer buttons for the current field
      this.footerBtns = [this.getCancelBtn()];
      // Load custom buttons defined in the field
      if (this.currentField.config && this.currentField.config.footerBtns) {
        this.footerBtns = this.footerBtns.concat(
          this.currentField.config.footerBtns
        )
      }
      this.footerBtns.push(this.getClearBtn());
      this.footerBtns.push(this.getBackBtn());
      this.footerBtns.push(this.getNextBtn());
      this.footerBtns.push(this.getFinishBtn());
    },
    onFieldValue(value: Option | Array<Option>) {
      this.setActiveFieldValue(value);
      if ("requireNext" in this.currentField 
        && !this.currentField.requireNext) {
        this.onNext();
      }
    }
  }
});
</script>
