<template>
  <div id="consistency_check">
    <div v-for="(text, index) in this.report_consistency_string" :key="index">
      {{text}}
    </div>
  </div>
</template>


<script>
/* eslint-disable @typescript-eslint/camelcase */
export default {
  data: function(){
    return {
      re_initiated_on_art: 0,
      cum_re_initiated_on_art: 0,
      newly_registered_quarterly: 0,
      newly_registered_cum: 0,
      quarterly_all_males: 0,
      cummulative_all_males: 0,
      pregnant_females_all_ages: 0,
      cum_pregnant_females_all_ages: 0,
      non_pregnant_females: 0,
      cum_non_pregnant_females: 0,
      children_below_24_months_at_art_initiation: 0,
      cum_children_below_24_months_at_art_initiation: 0,
      confirmed_hiv_infection_in_infants_pcr: 0,
      cum_confirmed_hiv_infection_in_infants_pcr: 0,
      quarterly_children_12_59_months: 0,
      cum_children_12_59_months: 0,
      breastfeeding_mothers: 0,
      cum_breastfeeding_mothers: 0,
      who_stage_two: 0,
      cum_who_stage_two: 0,
      asymptomatic: 0,
      cum_asymptomatic: 0,
      who_stage_three: 0,
      cum_who_stage_three: 0,
      who_stage_four: 0,
      cum_who_stage_four: 0,
      unknown_other_reason_outside_guidelines: 0,
      cum_unknown_other_reason_outside_guidelines: 0,
      no_tb: 0,
      cum_no_tb: 0,
      tb_within_the_last_two_years: 0,
      cum_tb_within_the_last_two_years: 0,
      current_episode_of_tb: 0,
      cum_current_episode_of_tb: 0,
      kaposis_sarcoma: 0,
      cum_kaposis_sarcoma: 0,
      total_alive_and_on_art: 0,
      died_within_the_1st_month_of_art_initiation: 0,
      died_within_the_2nd_month_of_art_initiation: 0,
      died_within_the_3rd_month_of_art_initiation: 0,
      died_after_the_3rd_month_of_art_initiation: 0,
      died_total: 0,
      defaulted: 0,
      stopped_art: 0,
      transfered_out: 0,
      zero_p: 0,
      zero_a: 0,
      two_p: 0,
      two_a: 0,
      four_p: 0,
      four_a: 0,
      five_a: 0,
      six_a: 0,
      seven_a: 0,
      eight_a: 0,
      nine_p: 0,
      nine_p_tabs: 0,
      nine_p_granules: 0,
      nine_a: 0,
      ten_a: 0,
      eleven_p: 0,
      eleven_p_tabs: 0,
      eleven_p_granules: 0,
      eleven_a: 0,
      twelve_a: 0,
      thirteen_a: 0,
      fourteen_p:  0,
      fourteen_a:  0,
      fifteen_p: 0,
      fifteen_a: 0,
      sixteen_p: 0,
      sixteen_a: 0,
      seventeen_p: 0,
      seventeen_a: 0,
      unknown_regimen: 0,
      total_pregnant_women: 0,
      total_breastfeeding_women: 0,
      total_other_patients: 0,
      tb_not_suspected: 0,
      tb_suspected: 0,
      tb_confirmed_currently_not_yet_on_tb_treatment: 0,
      tb_confirmed_on_tb_treatment: 0,
      unknown_tb_status: 0,
      total_patients_without_side_effects: 0,
      total_patients_with_side_effects: 0,
      unknown_side_effects: 0,
      patients_with_0_6_doses_missed_at_their_last_visit: 0,
      patients_with_7_plus_doses_missed_at_their_last_visit: 0,
      patients_with_unknown_adhrence: 0,
      total_patients_on_arvs_and_cpt: 0,
      total_patients_on_arvs_and_ipt: 0,
      total_patients_on_family_planning: 0,
      total_patients_with_screened_bp: 0,
      transfer_in: 0,
      cum_transfer_in: 0,
      males_initiated_on_art_first_time: 0,
      cum_males_initiated_on_art_first_time: 0,
      initial_pregnant_females_all_ages: 0,
      cum_initial_pregnant_females_all_ages: 0,
      initial_non_pregnant_females_all_ages: 0,
      cum_initial_non_pregnant_females_all_ages: 0,
      unknown_gender: 0,
      cum_unknown_gender: 0,
      initiated_on_art_first_time: 0,
      cum_initiated_on_art_first_time: 0,
      report_consistency_string: []
    }
  },
  methods: {
    startValidating(){
      for(let i = 0; i < this.dataparams.length; i++){
        if(this.dataparams[i].name == 're_initiated_on_art')
            this.re_initiated_on_art = parseInt(this.dataparams[i].contents);
     
        if(this.dataparams[i].name == 'cum_re_initiated_on_art')
            this.cum_re_initiated_on_art = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'transfer_in')
            this.transfer_in = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'cum_transfer_in')
            this.cum_transfer_in = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_registered')
            this.newly_registered_quarterly = parseInt(this.dataparams[i].contents);
      
        if(this.dataparams[i].name == 'cum_total_registered')
            this.newly_registered_cum = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'cum_all_males')
            this.cummulative_all_males = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'all_males')
            this.quarterly_all_males = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'non_pregnant_females')
            this.non_pregnant_females = parseInt(this.dataparams[i].contents);
      
        if(this.dataparams[i].name == 'cum_non_pregnant_females')
            this.cum_non_pregnant_females = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'pregnant_females_all_ages')
            this.pregnant_females_all_ages = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'cum_pregnant_females_all_ages')
            this.cum_pregnant_females_all_ages = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'children_below_24_months_at_art_initiation')
            this.children_below_24_months_at_art_initiation = parseInt(this.dataparams[i].contents);
      
        if(this.dataparams[i].name == 'cum_children_below_24_months_at_art_initiation')
            this.cum_children_below_24_months_at_art_initiation = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'children_24_months_14_years_at_art_initiation')
            this.children_24_months_14_years_at_art_initiation = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'cum_children_24_months_14_years_at_art_initiation')
            this.cum_children_24_months_14_years_at_art_initiation = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'adults_at_art_initiation')
            this.adults_at_art_initiation = parseInt(this.dataparams[i].contents);
      
        if(this.dataparams[i].name == 'cum_adults_at_art_initiation')
            this.cum_adults_at_art_initiation = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'presumed_severe_hiv_disease_in_infants')
            this.presumed_severe_hiv_disease_in_infants = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'cum_presumed_severe_hiv_disease_in_infants')
            this.cum_presumed_severe_hiv_disease_in_infants = parseInt(this.dataparams[i].contents);
        
        if(this.dataparams[i].name == 'confirmed_hiv_infection_in_infants_pcr')
            this.confirmed_hiv_infection_in_infants_pcr = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_confirmed_hiv_infection_in_infants_pcr')
            this.cum_confirmed_hiv_infection_in_infants_pcr = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'quarterly_children_12_59_months')
            this.quarterly_children_12_59_months = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_children_12_59_months')
            this.cum_children_12_59_months = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'pregnant_women')
            this.pregnant_women = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_pregnant_women')
            this.cum_pregnant_women = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'breastfeeding_mothers')
            this.breastfeeding_mothers = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_breastfeeding_mothers')
            this.cum_breastfeeding_mothers = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'who_stage_two')
            this.who_stage_two = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_who_stage_two')
            this.cum_who_stage_two = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'asymptomatic')
            this.asymptomatic = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_asymptomatic')
            this.cum_asymptomatic = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'who_stage_three')
            this.who_stage_three = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_who_stage_three')
            this.cum_who_stage_three = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'who_stage_four')
            this.who_stage_four = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_who_stage_four')
            this.cum_who_stage_four = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'unknown_other_reason_outside_guidelines')
            this.unknown_other_reason_outside_guidelines = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_unknown_other_reason_outside_guidelines')
            this.cum_unknown_other_reason_outside_guidelines = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'no_tb')
            this.no_tb = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_no_tb')
            this.cum_no_tb = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'tb_within_the_last_two_years')
            this.tb_within_the_last_two_years = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_tb_within_the_last_two_years')
            this.cum_tb_within_the_last_two_years = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'current_episode_of_tb')
            this.current_episode_of_tb = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_current_episode_of_tb')
            this.cum_current_episode_of_tb = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'kaposis_sarcoma')
            this.kaposis_sarcoma = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_kaposis_sarcoma')
            this.cum_kaposis_sarcoma = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_alive_and_on_art')
            this.total_alive_and_on_art = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'died_within_the_1st_month_of_art_initiation')
            this.died_within_the_1st_month_of_art_initiation = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'died_within_the_2nd_month_of_art_initiation')
            this.died_within_the_2nd_month_of_art_initiation = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'died_within_the_3rd_month_of_art_initiation')
            this.died_within_the_3rd_month_of_art_initiation = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'died_after_the_3rd_month_of_art_initiation')
            this.died_after_the_3rd_month_of_art_initiation = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'died_total')
            this.died_total = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'defaulted')
            this.defaulted = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'stopped_art')
            this.stopped_art = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'transfered_out')
            this.transfered_out = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'zero_p')
            this.zero_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'zero_a')
            this.zero_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'two_p')
            this.two_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'two_a')
            this.two_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'four_p')
            this.four_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'four_a')
            this.four_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'five_a')
            this.five_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'six_a')
            this.six_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'seven_a')
            this.seven_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'eight_a')
            this.eight_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'nine_p_tabs')
            this.nine_p_tabs = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'nine_p_granules')
            this.nine_p_granules = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'nine_a')
            this.nine_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'ten_a')
            this.ten_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'eleven_p_tabs')
            this.eleven_p_tabs = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'eleven_p_granules')
            this.eleven_p_granules = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'eleven_a')
            this.eleven_a = parseInt(this.dataparams[i].contents);
        // Why not `this[name] = parseInt(dataparams[i].contents)`?
        if(this.dataparams[i].name == 'twelve_a')
            this.twelve_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'thirteen_a')
            this.thirteen_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'fourteen_p')
            this.fourteen_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'fourteen_a')
            this.fourteen_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'fifteen_p')
            this.fifteen_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'fifteen_a')
            this.fifteen_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'sixteen_p')
            this.sixteen_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'sixteen_a')
            this.sixteen_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'seventeen_p')
            this.seventeen_p = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'seventeen_a')
            this.seventeen_a = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'unknown_regimen')
            this.unknown_regimen = parseInt(this.dataparams[i].contents);
    
        if(this.dataparams[i].name == 'total_pregnant_women')
            this.total_pregnant_women = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_breastfeeding_women')
            this.total_breastfeeding_women = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_other_patients')
            this.total_other_patients = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'tb_not_suspected')
            this.tb_not_suspected = parseInt(this.dataparams[i].contents);
   
        if(this.dataparams[i].name == 'tb_suspected')
            this.tb_suspected = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'tb_not_suspected')
            this.tb_not_suspected = parseInt(this.dataparams[i].contents);
    
        if(this.dataparams[i].name == 'tb_confirmed_currently_not_yet_on_tb_treatment')
            this.tb_confirmed_currently_not_yet_on_tb_treatment = parseInt(this.dataparams[i].contents);
   
        if(this.dataparams[i].name == 'tb_confirmed_on_tb_treatment')
            this.tb_confirmed_on_tb_treatment = parseInt(this.dataparams[i].contents);
    
        if(this.dataparams[i].name == 'unknown_tb_status')
            this.unknown_tb_status = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_patients_without_side_effects')
            this.total_patients_without_side_effects = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_patients_with_side_effects')
            this.total_patients_with_side_effects = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'unknown_side_effects')
            this.unknown_side_effects = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'patients_with_0_6_doses_missed_at_their_last_visit')
            this.patients_with_0_6_doses_missed_at_their_last_visit = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'patients_with_7_plus_doses_missed_at_their_last_visit')
            this.patients_with_7_plus_doses_missed_at_their_last_visit = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'patients_with_unknown_adhrence')
            this.patients_with_unknown_adhrence = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_patients_on_arvs_and_cpt')
            this.total_patients_on_arvs_and_cpt = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_patients_on_arvs_and_ipt')
            this.total_patients_on_arvs_and_ipt = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_patients_on_family_planning')
            this.total_patients_on_family_planning = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'total_patients_with_screened_bp')
            this.total_patients_with_screened_bp = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'males_initiated_on_art_first_time')
            this.males_initiated_on_art_first_time = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_males_initiated_on_art_first_time')
            this.cum_males_initiated_on_art_first_time = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'initial_pregnant_females_all_ages')
            this.initial_pregnant_females_all_ages = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_initial_pregnant_females_all_ages')
            this.cum_initial_pregnant_females_all_ages = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'initial_non_pregnant_females_all_ages')
            this.initial_non_pregnant_females_all_ages = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_initial_non_pregnant_females_all_ages')
            this.cum_initial_non_pregnant_females_all_ages = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'unknown_gender')
            this.unknown_gender = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_unknown_gender')
            this.cum_unknown_gender = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'initiated_on_art_first_time')
            this.initiated_on_art_first_time = parseInt(this.dataparams[i].contents);
        if(this.dataparams[i].name == 'cum_initiated_on_art_first_time')
          this.cum_initiated_on_art_first_time = parseInt(this.dataparams[i].contents);
      }  
    },
    validateReport(){
        if(this.newly_registered_cum < 1)
           return;
        /*############Section one: 26 -- 32 Has to equal to Total registered */
        let html_string = '';
        this.report_consistency_string = [];
        let total_26_32 = this.initial_non_pregnant_females_all_ages;
        total_26_32 += this.males_initiated_on_art_first_time;
        total_26_32 += this.initial_pregnant_females_all_ages;
        total_26_32 += this.unknown_gender;
        total_26_32 += this.re_initiated_on_art;
        total_26_32 += this.transfer_in;
        if(this.newly_registered_quarterly != total_26_32){
          html_string = "Section 26 - 32: Total registered (Quartely) is not equal to ";
          html_string += "CHECK: Total FT + Re Patients re-initiated on ART + TI Patients transferred in on ART";    
          this.report_consistency_string.push(html_string);
        }
        total_26_32 = this.cum_initial_non_pregnant_females_all_ages;
        total_26_32 += this.cum_males_initiated_on_art_first_time;
        total_26_32 += this.cum_initial_pregnant_females_all_ages;
        total_26_32 += this.cum_unknown_gender;
        total_26_32 += this.cum_re_initiated_on_art;
        total_26_32 += this.cum_transfer_in;
        if(this.newly_registered_cum != total_26_32){
          html_string = "Section 26 - 32: Total registered (Cummulative) is not equal to ";
          html_string += "CHECK: Total FT + Re Patients re-initiated on ART + TI Patients transferred in on ART";    
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*############Section two: 33 -- 35 Has to equal to Total registered */
        let total_33_35 = this.quarterly_all_males;
        total_33_35 += this.non_pregnant_females;
        total_33_35 += this.pregnant_females_all_ages;
        if(this.newly_registered_quarterly != total_33_35){
          html_string = "Section 33 - 35: Total registered (Quartely) is not equal to ";
          html_string += "M Males (all ages) + FNP Non-pregnant Females (all ages)  + FP Pregnant Females (all ages)";    
          this.report_consistency_string.push(html_string);
        }
        total_33_35 = this.cummulative_all_males;
        total_33_35 += this.cum_non_pregnant_females;
        total_33_35 += this.cum_pregnant_females_all_ages;
        if(this.newly_registered_cum != total_33_35){
          html_string = "Section 33 - 35: Total registered (Cummulative) is not equal to ";
          html_string += "M Males (all ages) + FNP Non-pregnant Females (all ages)  + FP Pregnant Females (all ages)";    
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*############Section two: 36 -- 38 Has to equal to Total registered */
        let total_36_38 = this.children_below_24_months_at_art_initiation;
        total_36_38 += this.children_24_months_14_years_at_art_initiation;
        total_36_38 += this.adults_at_art_initiation;
        if(this.newly_registered_quarterly != total_36_38){
          html_string = "Section 36 - 38: Total registered (Quartely) is not equal to ";
          html_string += "A Children below 24 m at ART initiation + B Children 24 m - 14 yrs at ART initiation + C Adults 15 years+ at ART initiation";    
          this.report_consistency_string.push(html_string);
        }
        total_36_38 = this.cum_children_below_24_months_at_art_initiation;
        total_36_38 += this.cum_children_24_months_14_years_at_art_initiation;
        total_36_38 += this.cum_adults_at_art_initiation;
        if(this.newly_registered_cum != total_36_38){
          html_string = "Section 36 - 38: Total registered (Cummulative) is not equal to ";
          html_string += "A Children below 24 m at ART initiation + B Children 24 m - 14 yrs at ART initiation + C Adults 15 years+ at ART initiation";    
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*Reason for starting ART #################################*/
        let total_39_48 = this.presumed_severe_hiv_disease_in_infants;
        total_39_48 += this.confirmed_hiv_infection_in_infants_pcr;
        total_39_48 += this.quarterly_children_12_59_months;
        total_39_48 += this.pregnant_women;
        total_39_48 += this.breastfeeding_mothers;
        total_39_48 += this.who_stage_two;
        total_39_48 += this.asymptomatic;
        total_39_48 += this.who_stage_three;
        total_39_48 +=  this.who_stage_four;
        total_39_48 += this.unknown_other_reason_outside_guidelines;
        if(this.newly_registered_quarterly != total_39_48){
          html_string = "Section 39 - 48: Total registered (Quartely) is not equal to ";
          html_string += "Pres. Sev. HIV disease age <12 m + PCR Infants <12 mths PCR + U5 Children 12-59mths";
          html_string += " + Preg Pregnant women + BF Breastfeeding mothers + CD4 CD4 below threshold";
          html_string += " + Asy Asymptomatic / mild + WHO stage 3 + WHO stage 4";
          html_string += " + Unknown / reason outside guidelines";
          this.report_consistency_string.push(html_string);
        }
        total_39_48 = this.cum_presumed_severe_hiv_disease_in_infants;
        total_39_48 += this.cum_confirmed_hiv_infection_in_infants_pcr;
        total_39_48 += this.cum_children_12_59_months;
        total_39_48 += this.cum_pregnant_women;
        total_39_48 += this.cum_breastfeeding_mothers;
        total_39_48 += this.cum_who_stage_two;
        total_39_48 += this.cum_asymptomatic;
        total_39_48 += this.cum_who_stage_three;
        total_39_48 +=  this.cum_who_stage_four;
        total_39_48 += this.cum_unknown_other_reason_outside_guidelines;
        if(this.newly_registered_cum != total_39_48){
          html_string = "Section 39 - 48: Total registered (Cummulative) is not equal to ";
          html_string += "Pres. Sev. HIV disease age <12 m + PCR Infants <12 mths PCR + U5 Children 12-59mths";
          html_string += " + Preg Pregnant women + BF Breastfeeding mothers + CD4 CD4 below threshold";
          html_string += " + Asy Asymptomatic / mild + WHO stage 3 + WHO stage 4";
          html_string += " + Unknown / reason outside guidelines";
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*Stage defining conditions at ART initiation #############
        Total registered should be equal to 49  - 51
        */
        let total_49_51 = this.no_tb;
        total_49_51 += this.tb_within_the_last_two_years;
        total_49_51 += this.current_episode_of_tb;
        if(this.newly_registered_quarterly != total_49_51){
          html_string = "Section 49 - 51: Total registered (Quartely) is not equal to ";
          html_string += "Nev/>2yrs	Never TB / TB over 2 years ago + Last 2yrs	TB within the last 2 years + Curr Current episode of TB";    
          this.report_consistency_string.push(html_string);
        }
        total_49_51 = this.cum_no_tb;
        total_49_51 += this.cum_tb_within_the_last_two_years;
        total_49_51 += this.cum_current_episode_of_tb;
        if(this.newly_registered_cum != total_49_51){
          html_string = "Section 49 - 51: Total registered (Cummulative) is not equal to ";
          html_string += "Nev/>2yrs	Never TB / TB over 2 years ago + Last 2yrs	TB within the last 2 years + Curr Current episode of TB";    
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /* #############
        Total registered should be equal to (53 + 58 + 59 + 60 + 61)
        */
        let total_53_61 = this.total_alive_and_on_art;
        total_53_61 += this.died_total;
        total_53_61 += this.defaulted;
        total_53_61 += this.stopped_art;
        total_53_61 += this.transfered_out;
        if(this.newly_registered_cum != total_53_61){
          html_string = "Section 53 - 61: Total registered (Cummulative) is not equal to ";
          html_string += "Total alive and on ART + Died total + Defaulted (more than 2 months overdue after expected to have run out of ARVs)";    
          html_string += " + Stopped taking ARVs (clinician or patient own decision, last known alive)";
          html_string += " + Transferred Out";
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /* ############Section 64  - 80: Total Alive and On ART should be equal to (64 - 80)
        */
        function isEqualToSumOf(base, otherValues) {
            const sum = otherValues.reduce((previous, current) => previous + current, 0);
            return base === sum;
        }
        const regimens = [this.zero_p, this.zero_a, this.two_p, this.two_a, this.four_p, this.four_a,
                          this.five_a, this.six_a, this.seven_a, this.eight_a, this.nine_p_tabs,this.nine_p_granules, 
                          this.nine_a, this.ten_a, this.eleven_p_tabs, this.eleven_p_granules, this.eleven_a, 
                          this.twelve_a, this.unknown_regimen, this.thirteen_a, this.fourteen_a, 
                          this.fifteen_a, this.sixteen_a, this.seventeen_a,
                          this.fourteen_p, this.fifteen_p, this.sixteen_p, this.seventeen_p];
        if (!isEqualToSumOf(this.total_alive_and_on_art, regimens)) {
            this.report_consistency_string.push(
                "Section 64 - 80: Total alive and on ART is not equal to Regimens sections"
            );
        }
        /*#####################################*/
        /*Section Section: 81 - 83 #####################*/    
        let total_81_83 =  this.total_pregnant_women;
        total_81_83 += this.total_breastfeeding_women;
        total_81_83 += this.total_other_patients;
        if(this.total_alive_and_on_art != total_81_83){
          html_string = "Section 81 - 83: Total alive and on ART is not equal to ";
          html_string += " Pregnant + Breastfeeding + All others (not circled)";
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*Section Section: 84 - 88 #####################*/    
        let total_84_88 =  this.tb_not_suspected;
        total_84_88 += this.tb_suspected;
        total_84_88 += this.tb_confirmed_currently_not_yet_on_tb_treatment;
        total_84_88 += this.tb_confirmed_on_tb_treatment;
        total_84_88 += this.unknown_tb_status;
        if(this.total_alive_and_on_art != total_84_88){
          html_string = "Section 84 - 88: Total alive and on ART is not equal to ";
          html_string += " TB not suspected + TB suspected + TB conf., not on Rx + TB conf., on TB Rx + Unknown (not circled)";
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*Section Section: 89 - 91 #####################*/    
        let total_89_91 =  this.total_patients_without_side_effects;
        total_89_91 += this.total_patients_with_side_effects;
        total_89_91 += this.unknown_side_effects;
        if(this.total_alive_and_on_art != total_89_91){
          html_string = "Section 88 - 91: Total alive and on ART is not equal to ";
          html_string += " None + Any side effects + Unknown (not circled)";
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
        /*Section Section: 92 - 94 #####################*/    
        let total_92_94 =  this.patients_with_0_6_doses_missed_at_their_last_visit;
        total_92_94 += this.patients_with_7_plus_doses_missed_at_their_last_visit;
        total_92_94 += this.patients_with_unknown_adhrence;
        if(this.total_alive_and_on_art != total_92_94){
          html_string = "Section 92 - 94: Total alive and on ART is not equal to ";
          html_string += " 0 – 3 doses missed + 4+ doses missed + Unknown (not circled)";
          this.report_consistency_string.push(html_string);
        }
        /*#####################################*/
    }
  },
  props: ["dataparams"],
  watch: {
    dataparams: {
      immediate: true,
      handler() {
        this.startValidating();
        this.validateReport();
      }
    }
  }
}
</script>

<style scoped>
div {
    width: 100%;
    text-align: left;
    padding-left: 5px;
}
#consistency_check div {
    color: red;
    padding-bottom: 10px;
}
</style>