import { Service } from '@/services/service';
import dayjs from 'dayjs';
import Strings from '../utils/Strings';

export default class PatientVisitsService extends Service {
  
  constructor() {
    super()
  }

  static getStatistics() {
    return super.getJsonSWR('dashboard_stats', {
      date: super.getSessionDate(),
      'program_id': super.getProgramID()
    })
  }

  static getTodaysPatientVisits(data: any) {
    const keys = Object.keys(data)
    let total = 0
    const visits: Array<any> = []

    keys.forEach(key => {
      visits.push({
        label: Strings.capitalizeFirstLetter(key.replace('_', ' ')),
        value: data[key],
        color: 'lightyellow'
      })

      total += data[key]
    })

    visits.push({
      label: 'Total',
      value: total,
      color: 'yellowgreen'
    })

    return visits
  }

  static getAccumulativePatientVisits(data: any) {
    const visitTypes = Object.keys(data)
    const keys = Object.keys(data[visitTypes[0]])
    const days: Array<string> = []
    const visits: Array<any> = []

    for (const type in visitTypes) {
      const counts: Array<number> = []

      for (const key in keys) {        
        const date = data[visitTypes[type]][keys[key]].start_date
        const formattedDate = dayjs(date).format("MMM/YYYY")
        if(formattedDate !== days[key]) days.push(formattedDate)

        counts.push(data[visitTypes[type]][keys[key]].count)
      }

      visits.push({
        name: Strings.capitalizeFirstLetter(visitTypes[type]),
        data: counts
      })
    }

    return {
      days,
      visits
    }
  }
}