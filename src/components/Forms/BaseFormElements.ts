import BarcodeInput from "@/components/FormElements/HisBarcodeInput.vue"
import NoteInput from "@/components/FormElements/HisNote.vue"
import SingleSelect from "@/components/FormElements/HisSelect.vue";
import SingleSelectCards from "@/components/FormElements/HisCardSelector.vue";
import MultipleSelect from "@/components/FormElements/HisMultipleSelect.vue";
import TextInput from "@/components/FormElements/HisTextInput.vue"
import NumberInput from "@/components/FormElements/HisNumberInput.vue"
import MonthlyDays from "@/components/FormElements/HisMonthlyDays.vue"
import ArtRegimenSelection from "@/components/FormElements/HisArtRegimenSelection.vue"
import NextVisitInterval from "@/components/FormElements/HisNextVisitInterval.vue"
import TableViewer from "@/components/FormElements/HisTableViewer.vue"
import DosageInput from "@/components/FormElements/HisDosageInput.vue"
import YesNo from "@/components/FormElements/YesNoSelect.vue"
import MultiYesNo from "@/components/FormElements/MultiYesNoSelect.vue"
import WeightChart from "@/components/FormElements/HisWeightChart.vue"
import VitalsEntry from "@/components/FormElements/HisVitalsEntry.vue"
import AppointmentsEntry from "@/components/FormElements/HisAppointments.vue"
import ComplaintsPicker from "@/components/FormElements/HisComplaintsPicker.vue";
import ClinicHolidayPicker from "@/components/FormElements/HisClinicHolidayPicker.vue"
import SummaryPage from "@/components/FormElements/HisSummary.vue"
import ArtStagingSummary from "@/components/FormElements/ArtStagingSummary.vue"
import AdherenceInput from "@/components/FormElements/HisAdherenceInput.vue"
import LabOrders from "@/components/FormElements/HisLabOrders.vue"
import DispensationInput from "@/components/FormElements/DrugDispensationSelection.vue"
import ProgamSelection from "@/components/FormElements/ProgramSelection.vue"
import AppointmentPicker from "@/components/FormElements/HisAppointmentPicker.vue"
import PersonSearchView from "@/components/FormElements/PersonSearchView.vue"
import RelationSelection from "@/components/FormElements/RelationsSelection.vue"
import FilingNumberView from "@/components/FormElements/FilingNumberView.vue"
import PersonMatchView from "@/components/FormElements/PersonMatchView.vue"
import DateInput from "@/components/FormElements/HisDateInput.vue"
import BatchEntry from "@/components/FormElements/HisBatchEntry.vue"
import BatchVerification from "@/components/FormElements/HisBatchVerification.vue"
import BatchMovement from "@/components/FormElements/HisBatchMovement.vue"
import IPAddressInput from "@/components/FormElements/HisIPAddress.vue"
import TextBanner from "@/components/FormElements/HisTextBanner.vue"
import DrugDispenser from "@/components/FormElements/GeneralDrugDispenser.vue"

// Reference names for BaseFormComponents
export enum FieldType {
    TT_NOTE = 'NoteInput',
    TT_BARCODE = 'BarcodeInput',
    TT_MONTHLY_DAYS="monthly-days",
    TT_TEXT="text-input",
    TT_NUMBER = "number-input",
    TT_DATETIME="datetime",
    TT_SELECT="single-select",
    TT_MULTIPLE_SELECT="multiple-select",
    TT_ART_REGIMEN_SELECTION="art-regimen-selection",
    TT_NEXT_VISIT_INTERVAL_SELECTION="next-visit-interval",
    TT_TABLE_VIEWER="table-viewer",
    TT_DOSAGE_INPUT="dosage-input",
    TT_YES_NO="yes-no",
    TT_MULTIPLE_YES_NO="multi-yes-no",
    TT_SUMMARY="summary-page",
    TT_WEIGHT_CHART = "weight-chart",
    TT_VITALS_ENTRY="vitals-entry",
    TT_ADHERENCE_INPUT = "adherence-input",
    TT_ART_STAGING_SUMMARY = "art-staging-summary",
    TT_LAB_ORDERS = "lab-orders",
    TT_APPOINTMENTS_ENTRY = "appointments-entry",
    TT_DISPENSATION_INPUT = 'dispensation-input',
    TT_PROGRAM_SELECTION = 'ProgamSelection',
    TT_APPOINTMENT_PICKER = 'appointment-picker',
    TT_PERSON_RESULT_VIEW = 'PersonSearchView',
    TT_RELATION_SELECTION = 'RelationSelection',
    TT_FILING_NUMBER_VIEW = 'FilingNumberView',
    TT_CARD_SELECTOR = 'SingleSelectCards',
    TT_PERSON_MATCH_VIEW = 'PersonMatchView',
    TT_FULL_DATE = 'date-input',
    TT_BATCH_ENTRY = 'batch-entry',
    TT_BATCH_VERIFICATION = 'batch-verification',
    TT_BATCH_MOVEMENT = 'batch-movement',
    TT_COMPLAINTS_PICKER = 'complaints-picker',
    TT_IP_ADDRESS = 'IPAddressInput',
    TT_TEXT_BANNER = 'text-banner',
    TT_DRUG_DISPENSER = 'drug-dispenser',
    TT_CLINIC_HOLIDAY_PICKER = 'clinic-holiday-picker'
}

// Components to be rendered
export const BaseFormComponents = {
    TextInput,
    SingleSelect,
    MultipleSelect,
    NumberInput,
    MonthlyDays,
    BarcodeInput,
    ArtRegimenSelection,
    NextVisitInterval,
    TableViewer,
    DosageInput,
    YesNo,
    SummaryPage,
    MultiYesNo,
    WeightChart,
    VitalsEntry,
    AdherenceInput,
    ArtStagingSummary,
    LabOrders,
    AppointmentsEntry,
    DispensationInput,
    ProgamSelection,
    AppointmentPicker,
    PersonSearchView,
    RelationSelection,
    FilingNumberView,
    SingleSelectCards,
    PersonMatchView,
    DateInput,
    BatchEntry,
    BatchVerification,
    BatchMovement,
    ComplaintsPicker,
    IPAddressInput,
    TextBanner,
    DrugDispenser,
    ClinicHolidayPicker,
    NoteInput
}
