<script lang='ts'>
import { defineComponent, PropType } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { IonList, IonItem, IonLabel} from "@ionic/vue"
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import { Option } from '../Forms/FieldInterface'
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import SelectConfig from "@/components/FormElements/Interfaces/SelectConfig"
import ViewPort from "@/components/DataViews/ViewPort.vue"
export default defineComponent({
    components: { IonList, IonItem, IonLabel, HisTextInput, HisKeyboard, ViewPort },
    props: {
        config: {
            type: Object as PropType<SelectConfig>,
        },
        preset: {
            type: Object as PropType<Option>,
            required: true
        },
        fdata: {
            type: Object,
            required: true
        },
        cdata: {
            type: Object,
            required: true
        },
        clear: {
            type: Boolean
        },
        options: {
            required: true,
            type: Function
        },
        activationState: {
            type: String,
            default: ''
        },
        onValue: {
            type: Function
        },
        onValueUpdate: {
            type: Function
        }
    },
    data: () => ({ 
        showKeyboard: false,
        selected: '',
        filter: '',
        filtered: [] as any,
        keyboard: QWERTY,
        listData: [] as Array<Option>
    }),
    created(){
        if (this.config) {
            if (this.config.showKeyboard === true) {
                this.showKeyboard = true
            }
        }
    },
    watch: {
        listData: {
            handler(data: any) { if (data) this.filtered = data },
            deep: true,
            immediate: true
        },
        filter: {
            async handler(filter: string) {
                if (!filter) return this.filtered = this.listData

                if (this.config?.isFilterDataViaApi) {
                    return this.filtered = await this.options(this.fdata, filter)
                }
                this.filtered = this.listData.filter(item => this.isMatch(item.label, this.filter))
            },
            immediate: true
        }
    },
    methods: {
        isMatch(itemA: string, itemB: string){
            return itemA.match(new RegExp(itemB, 'i')) 
        },
        clearSelection() {
            this.filter = ''
            this.selected = ''
            this.$emit('onClear')
        },
        onKbValue(text: any, filtered = true) {
            if (!filtered) return

            this.filter = text
            this.selected = this.filter
        },
        keypress(text: any){
            if (!this.filter) this.selected = ''

            this.filter = handleVirtualInput(text, this.selected)
            this.selected = this.filter
        }
    }
})
</script>