import { AppEncounterService } from "@/services/app_encounter_service"
import { ObservationService } from "@/services/observation_service"

export class BPManagementService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
      super(patientID, 48, providerID) //TODO: Use encounter type reference name'
    }

    getSystolicBp() {
      return ObservationService.getFirstValueNumber(this.patientID, 'Systolic blood pressure')
    }

    getDiastolicBp() {
      return ObservationService.getFirstValueNumber(this.patientID, 'Diastolic blood pressure')
    }

    async onBpDrugs() {
      const query = await ObservationService.getFirstValueCoded(this.patientID, 'Treatment status')
      return query ? query === 'Yes' : false
    }
  
    async getBPTrail() {
      return await AppEncounterService.getJson(`/patients/${this.patientID}/bp_trail`);
    }
    async getCurrentDrugs() {
      return await AppEncounterService.getJson(`/patients/${this.patientID}/current_bp_drugs`);
    }
    async getLastDrugs() {
      return await AppEncounterService.getJson(`/patients/${this.patientID}/last_bp_drugs_dispensation`);
    }
    async getAdherence(drugID: number, pills: number) {
      return await AppEncounterService.postJson(`/patients/${this.patientID}/remaining_bp_drugs`, {
        'drug_id': drugID,
        pills: pills
      });
    }
    async enrollPatient(state: any) {
      return await AppEncounterService.postJson(`/patients/${this.patientID}/update_or_create_htn_state`, state);
    }
    static htnDrugReferences() {
      return [
        { 
          'drug_id': 275,
          'drug_name': "HCZ (25mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 942,
          'drug_name': "Enalapril (5mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 943,
          'drug_name': "Enalapril (10mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 558,
          'drug_name': "Amlodipine (5mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 559,
          'drug_name': "Amlodipine (10mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 117,
          'drug_name': "Atenolol (50mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 11,
          'drug_name': "Atenolol(100mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        }
      ]
    }
    getDrugs() {
        return {
        HCZ: {
          drugs: [
            {
              drugName: "HCZ (25mg tablet)",
              drugID: 275,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Enalapril: {
          drugs: [
            {
              drugName: "Enalapril (5mg tablet)",
              drugID: 942,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Enalapril (10mg tablet)",
              drugID: 943,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Amlodipine: {
          drugs: [
            {
              drugName: "Amlodipine (5mg tablet)",
              drugID: 558,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Amlodipine (10mg tablet)",
              drugID: 559,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Atenolol: {
          drugs: [
            {
              drugName: "Atenolol (50mg tablet)",
              drugID: 117,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Atenolol(100mg tablet)",
              drugID: 11,
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
      }
    }
}