import { AppEncounterService } from "@/services/app_encounter_service";
import { isArray } from "lodash";
export class VitalsService extends AppEncounterService{
  constructor(patientID: number, providerID: number) {
    super(patientID, 6, providerID);
  }
  isNotEmptyandNumber(vital: any) {
    return `${vital.value}`.match(/^-?\d+\.?\d*$/) ? null : [`Invalid entry for ${vital.label}`]
  }
  isNotEmptyandFloat(vital: any) {
    return `${vital.value}`.match(/^\d{1,3}\.\d{1,5}$/) ? null : [`Invalid entry for ${vital.label}`]
  }
  checkMinMax(val: any, min: number, max: number) {
    const p = [];
    if (parseFloat(`${val.value}`) < min) {
      p.push([`${val.label} entered is less than minimum ${val.label}`])
    }
    if (parseFloat(`${val.value}`) > max) {
      p.push([`${val.label} entered is greater than maximum ${val.label}`])
    }
    return p.length > 0 ? p : null;
  }
  validateAll(vitals: any) {
    const p: any = [];
    vitals.map((vital: any) => {
      const j = this.validator(vital);
      return isArray(j) ? p.push(j) : null
    })
    return p.length > 0 ? p : null;
  }

  mergeErrors(errors: any[]) {
    const holder: any = [];
    errors.forEach(element => {
      if (isArray(element)) {
        holder.push(element)
      }
    });
    return holder.length > 0 ? holder : null
  }
  isValidBPReading(vital: any) {
    const p = [];
    const isValidBP =  `${vital.value}`.match(/^\d{1,3}\/\d{1,3}$/g) ? null : ['Invalid BP reading']
    p.push(isValidBP);
    if(isValidBP == null) {
      const value = `${vital.value}`.split('/');
      
      const bpSystolic = {
        label: 'Systolic',
        value: value[0]
      };
      const bpDiastolic = {
        label: 'Diastolic',
        value: value[1]
      };
      p.push(this.checkMinMax(bpDiastolic, 30, 200))
      p.push(this.checkMinMax(bpSystolic, 40, 250))
    }
    return this.mergeErrors(p)
  }
  
  validator(vital: any) {

    const values = [
      {
        name: "Weight",
        validator: (val: any) => {
          const emptyErrors = this.isNotEmptyandFloat(val);
          const minErrors = this.checkMinMax(val, 1, 300);
          return this.mergeErrors([emptyErrors, minErrors]); 
        },
      },
      {
        name: "Height",
        validator: (val: any) => {
          const emptyErrors = this.isNotEmptyandNumber(val);
          const minErrors = this.checkMinMax(val, 40, 220);
          return this.mergeErrors([emptyErrors, minErrors]); 
        },
      }, {
        name: "BP",
        validator: (val: any) => {
          return this.isValidBPReading(val)
        },
      }, {
        name: "Temp",
        validator: (val: any) => {
          const emptyErrors = this.isNotEmptyandNumber(val);
          const minErrors = this.checkMinMax(val, 30, 42);
          return this.mergeErrors([emptyErrors, minErrors]); 
        },
      }, {
        name: "SP02",
        validator: (val: any) => {
          const minErrors = this.checkMinMax(val, 40, 100);
          return this.mergeErrors([minErrors]); 
        },
      }, {
        name: "Pulse",
        validator: (val: any) => {
          const minErrors = this.checkMinMax(val, 50, 120);
          return this.mergeErrors([minErrors]); 
        },
      }
    ]
    const v = values.filter(element => {
      return element.name === vital.label;
    });
    if (v.length > 0) {
      return v[0].validator(vital);
    }
    return null
  }
}