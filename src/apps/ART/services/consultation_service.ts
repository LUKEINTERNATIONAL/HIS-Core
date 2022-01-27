import { DrugInterface } from "@/interfaces/Drug";
import { AppEncounterService } from "@/services/app_encounter_service";
import { ObservationService } from "@/services/observation_service";
export class ConsultationService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 53, providerID);
  }
  getFamilyPlanningMethods() {
    return [
      "ORAL CONTRACEPTIVE PILLS",
      "DEPO-PROVERA",
      "INTRAUTERINE CONTRACEPTION",
      "CONTRACEPTIVE IMPLANT",
      "MALE CONDOMS",
      "FEMALE CONDOMS",
      "TUBAL LIGATION",
      "NONE",
    ];
  }

  async hasTreatmentHistoryObs() {
    const obsDate = await ObservationService.getFirstObsDatetime(this.patientID, 'Previous TB treatment history')
    return obsDate && this.date > obsDate
  }

  getDrugSideEffects() {
    const sessionDate = AppEncounterService.getSessionDate();
    return AppEncounterService.getJson(`/programs/1/patients/${this.patientID}/medication_side_effects`, { date: sessionDate });
  }
  getClient() {
    return AppEncounterService.getFirstValueCoded(this.patientID, 'Patient Present');
  }
  async getTLObs() {
    const TLConcept = await AppEncounterService.getConceptID('Tubal ligation');
    const FPConcept = await AppEncounterService.getConceptID('Family planning method');
    const obs = await AppEncounterService.getObs({
      'person_id': this.patientID,
      'concept_id': FPConcept,
      'value_coded': TLConcept
    })
    if (obs.length > 0) {
      return true
    } else {
      const FPBackupConcept = await AppEncounterService.getConceptID('Family planning, action to take');
      const backupObs = await AppEncounterService.getObs({
        'person_id': this.patientID,
        'concept_id': FPBackupConcept,
        'value_coded': TLConcept
      })
      if (backupObs.length > 0) {
        return true
      }
    }
    return false
  }
  async getPreviousDrugs() {

    const drugs = await AppEncounterService.getJson(
      `patients/${this.patientID}/drugs_received`
    )

    if (!drugs) return

    const uniqueDrugs = {} as any
    drugs.forEach((drug: DrugInterface) => {
      uniqueDrugs[drug.drug_inventory_id] = drug;
    })
    return uniqueDrugs;
  }
  familyPlanningMethods(label: string, values: any[]) {
    const familyPlanningLogic: any = {
      "ORAL CONTRACEPTIVE PILLS": {
        "DEPO-PROVERA": 'N', "INTRAUTERINE CONTRACEPTION": 'N', 'CONTRACEPTIVE IMPLANT': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "DEPO-PROVERA": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "INTRAUTERINE CONTRACEPTION": 'N', 'CONTRACEPTIVE IMPLANT': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "INTRAUTERINE CONTRACEPTION": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'CONTRACEPTIVE IMPLANT': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "CONTRACEPTIVE IMPLANT": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "MALE CONDOMS": {
        "ORAL CONTRACEPTIVE PILLS": 'Y', "DEPO-PROVERA": 'Y', 'INTRAUTERINE CONTRACEPTION': 'Y',
        'CONTRACEPTIVE IMPLANT': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'Y', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'Y'
      },
      "FEMALE CONDOMS": {
        "ORAL CONTRACEPTIVE PILLS": 'Y', "DEPO-PROVERA": 'Y', 'INTRAUTERINE CONTRACEPTION': 'Y',
        'CONTRACEPTIVE IMPLANT': 'Y', 'MALE CONDOMS': 'Y', 'RYTHM METHOD': 'Y', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'Y'
      },
      "RYTHM METHOD": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'CONTRACEPTIVE IMPLANT': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "TUBAL LIGATION": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'N', 'FEMALE CONDOMS': 'N', 'CONTRACEPTIVE IMPLANT': 'N', 'RYTHM METHOD': 'N',
        'VASECTOMY': 'N',
      },
      "VASECTOMY": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'Y', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'N', 'CONTRACEPTIVE IMPLANT': 'Y', 'RYTHM METHOD': 'N',
        'TUBAL LIGATION': 'N'
      },
      "NONE": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'N', 'FEMALE CONDOMS': 'N', 'CONTRACEPTIVE IMPLANT': 'N', 'RYTHM METHOD': 'N',
        'TUBAL LIGATION': 'N'
      }
    }
    const selected = familyPlanningLogic[label];
    return values.map(data => {
      if (selected[data.label] === "N") {
        return {
          label: data.label,
          value: data.value,
          isChecked: false,
          disabled: true,
        }
      }
      else {
        return {
          label: data.label,
          value: data.value,
          isChecked: data.isChecked,
          disabled: false,
        }
      }

    })
  }

}