<template>
  <!-- 
    HACK: dont remove the this, 
    some components dont render without it's presence
  --->
  {{currentField}}
  <!-- END OF HACK --->
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col>
            <ion-title>{{ helpText }}</ion-title>
          </ion-col>
          <ion-col v-if="currentField?.config?.toolbarInfo">
            <info-card :style="{height: '100%'}" :items="currentField?.config?.toolbarInfo"/>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <keep-alive>
        <component
          :key="currentField.id"
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
import { BaseFormComponents } from "@/components/Forms/BaseFormElements";
import { findIndex, isEmpty } from "lodash";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { 
  Field, 
  Option,
  FormFooterBtns
} from "./FieldInterface";
import {
  IonPage,
  IonCol,
  IonRow,
  IonButtons,
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonHeader,
  IonTitle,
} from "@ionic/vue";
import { alertConfirmation, toastWarning } from "@/utils/Alerts";
import InfoCard from "@/components/DataViews/HisFormInfoCard.vue"
import {toastDanger} from "@/utils/Alerts"

export default defineComponent({
  name: "TouchscreenForm",
  components: {
    InfoCard,
    IonButtons,
    IonPage,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonHeader,
    IonTitle,
    IonCol,
    IonRow,
    ...BaseFormComponents,
  },
  emits: [
    'onFinish',
    'onIndex'
  ],
  props: {
    onFinish: {
      type: Function
    },
    skipSummary: {
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
    isClear: false,
    currentIndex: 0,
    currentField: {} as Field,
    formData: {} as any,
    computedFormData: {} as any,
    footerBtns: [] as Array<FormFooterBtns>,
    currentFields: [] as Array<Field>,
    state: "" as
      | "init"
      | "onsubmit"
      | "onload"
      | "unload"
      | "next"
      | "prev"
      | "onfinish"
      | "onValue"
      | "default"
  }),
  computed: {
    helpText(): string {
      return this.currentField.dynamicHelpText
        ? this.currentField.dynamicHelpText(this.formData)
        : this.currentField.helpText
    }
  },
  watch: {
    /**
     * Initiate the form if all fields are available
     */
    fields: {
      async handler(fields: Array<Field>) {
        if (!isEmpty(fields)) {
          this.buildFormData(fields);
          let dataFields = fields;
          if (!this.skipSummary) {
            dataFields = [...dataFields, this.getDefaultSummaryField()];
          }
          this.currentFields = dataFields;
          await this.onNext(); //look for a field to mount initially
        }
      },
      immediate: true,
      deep: true
    },
    /**
     * Switch the view to a target field
    */
    activeField: {
      handler(field: string) {
        if (field) {
          const i = findIndex(this.currentFields, { id: field });
          if (i >= 0 && i <= this.currentFields.length) {
            this.setActiveField(i)
            this.$emit('onIndex', i)
          }
        }
      }
    }
  },
  methods: {
    /**
     * Redirects to a specified route or defaults to the previous view
     */
    getCancelBtn(): FormFooterBtns {
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
        }
      }
    },
    /**
     * Clear the current's field value. However this depends if 
     * the field supports this feature
     */
    getClearBtn(): FormFooterBtns {
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
    /**
     * Go to the previous page on the form
     */
    getBackBtn(): FormFooterBtns {
      const visibleCondition = () => {
        if (this.currentFields.length === 1 
          || this.currentIndex <= 0) {
            return false;
          }
        return true;
      }
      return {
        name: "Back",
        slot: "end",
        state: {
          disabled: {
            default: () => false,
            onsubmit: () => true
          },
          visible: {
            onload: () => visibleCondition(),
            default: () => visibleCondition()
          }
        },
        onClick: () => this.goBack()
      };
    },
    /**
     * Go to the next index in the array of fields
     */
    getNextBtn(): FormFooterBtns {
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
            onsubmit: () => true,
            default(field: Field) {
              if ('requireNext' in field) {
                return !field.requireNext
              }
              return false
            }
          },
          visible: {
            onsubmit: () => false,
            onfinish: () => false,
            default: () => visibleCondition(),
            onload: () => visibleCondition()
          }
        },
        onClick: () => this.goNext(),
      };
    },
    /**
     * When clicked it notifies the parent that form has been submitted
     */
    getFinishBtn(): FormFooterBtns {
      const visibilityCondition = () => {
        return this.currentIndex+1 >= this.currentFields.length
      }
      return {
        name: "Finish",
        color: "success",
        slot: "end",
        state: {
          disabled: {
            default: () => false,
            onsubmit: () => true,
          },
          visible: {
            onfinish: () => true,
            onsubmit: () => true,
            default:() => visibilityCondition(),
            onload: () => visibilityCondition()
          },
        },
        onClick: () => this.goNext(),
      };
    },
    /**
     * Shows or hides a footer button based on it's defined states
     */
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
    /**
     * Disables or enables a footer button based on it's defined states
     */
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
    /**
     * Built in field to consolidates and displays all data that were
     * entered on the form
     */
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
            // We need to retrieve field configuration 
            // inorder to map labels to helpText and 
            // to check if the field should be visible on the summary...e.t.c
            const field = this.currentFields.filter(
              (i: Field) => i.id === ref || i.proxyID === ref
            )[0];
            const fdata = formData[ref];
            // A field has the right to disable itself from appearing on the
            // summary
            if (
              !fdata ||
              (field.appearInSummary != undefined &&
                !field.appearInSummary(formData, ref))
            )
              continue;
            const values = Array.isArray(fdata) ? fdata : [fdata];

            values.forEach((item) => {
              if (field.summaryMapValue) {
                // A field can configure how it's data should appear on the 
                // summary page. This overrides the default process of showing values
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
    /**
     * Run default action when the form is submitted
    */
    async onFinishAction() {
      if (this.onFinish) {
        try {
          this.state = 'onsubmit'
          await this.onFinish(this.formData, this.computedFormData)
        }catch(e) { 
          toastDanger(e) 
        }
      }
      this.state = 'onfinish'
      this.$emit('onFinish', this.formData, this.computedFormData)
    },
    /**
     * Goes to next component if they're no errors on the page
     */
    async goNext() {
      // Run field validations before goind next
      if (this.currentField.validation) {
        const value = this.formData[this.currentField.id];
        const errors = this.currentField.validation(
          value, this.formData, this.computedFormData
        )
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
      await this.onNext();
    },
    /**
     * Go to the previous page if conditions are ok
     */
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
    /**
     * Callback when the field component has been activated.
     * if  a callback is defined, we pass an instance of the active field
     * so that it can be manipulated by the parent.
     */
    onFieldActivated(fieldContext: any) {
      this.state = "onload";
      if (this.currentField.onload) this.currentField.onload(fieldContext);
    },
    /**
     * Callback before the active field is replaced
     */
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
      fields.forEach((field) => {
        /**
         * Fields with proxyIDs write their values in the same place
         * unlike normal IDs !!
        */
       if (field.proxyID) {
        this.formData[field.proxyID] = null
       }
       this.formData[field.id] = null
      })
    },
    async setActiveFieldValue(value: any) {
      this.state = "onValue";
      const proxyID = this.currentField.proxyID
      const id = this.currentField.id

      if (proxyID) this.formData[proxyID] = value

      this.formData[id] = value;

      let computeValue: any = null

      if (this.currentField.computedValue) {
        //Avoid sending null values to avoid crashing the callback
        if (value) {
          computeValue = this.currentField.computedValue(
            value, this.formData, this.computedFormData
          );
        }
        if (proxyID) {
          this.computedFormData[proxyID] = computeValue
        } else {
          this.computedFormData[id] = computeValue
        }
      }
    },
    /**
     * Determine which field to show next by it's condition
     */
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
      await this.onFinishAction()
    },
    /**
     * Push the current field to be displayed
     */
    async setActiveField(index: number, state = "" as "init" | "next" | "prev") {
      await this.onUnload(state);
      this.state = state;
      this.currentIndex = index;
      this.currentField = this.currentFields[this.currentIndex];
      // create new instance of footer buttons all new fields
      this.footerBtns = [this.getCancelBtn()];
      // Load custom buttons defined in the field
      if (this.currentField.config 
        && this.currentField.config.footerBtns) {
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
