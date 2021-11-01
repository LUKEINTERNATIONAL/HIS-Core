import { Service } from "@/services/service"

interface Drug {
	drugID: number;
	shortName: string;
	fullName: string;
	packSizes: number[];
}
const finalList: Drug[] = [
	{
		drugID: 105,
		shortName: "Acyclovir 200mg",
		fullName: "Acyclovir 200mg",
		packSizes: [30]
	},
	{
		drugID: 1044,
		shortName: "ABC 120 /3TC 300mg",
		fullName: "Abacavir and Lamivudine 120mg pack of 60 tablets",
		packSizes: [60]
	},
	{
		drugID: 969,
		shortName: "ABC 600 / 3TC 300mg",
		fullName: "Abacavir sulfate 600mg / Lamivudine 300mg, tin of 30 tablets",
		packSizes: [30]
	},
	{
		drugID: 932,
		shortName: "ATV 300 / r 100mg",
		fullName: "Atazanavir / Ritonavir 300 / 100mg, tin of 30 tablets",
		packSizes: [30]
	},
	{
		drugID: 39,
		shortName: "AZT 300 /3TC 150mg",
		fullName: "Zidovudine / lamivudine 300 / 150mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 731,
		shortName: "AZT 300 / 3TC 150 / NVP 200mg",
		fullName: "Zidovudine / lamivudine /Nevirapine 300 / 150 / 200mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 732,
		shortName: "AZT 60 / 3TC 30 / NVP 50mg",
		fullName: "Zidovudine / lamivudine /Nevirapine 60 / 30 / 50mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 736,
		shortName: "AZT 60 / 3TC 30mg",
		fullName: "Zidovudine / lamivudine 60 / 30mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 963,
		shortName: "CPT 120mg",
		fullName: "Cotrimoxazole 120mg, blister pack of 1000 dispersible tablets",
		packSizes: [1000]
	},
	{
		drugID: 297,
		shortName: "CPT 480mg",
		fullName: "Cotrimoxazole 480mg, tin of 1000 tablets",
		packSizes: [1000]
	},
	{
		drugID: 576,
		shortName: "CPT 960mg",
		fullName: "Cotrimoxazole 960mg, blister pack of 1000 tablets"
		, packSizes: [1000]
	},
	{
		drugID: 976,
		shortName: "DRV 600mg",
		fullName: "Darunavir 600mg pack of 60 tablets",
		packSizes: [60]
	},
	{
		drugID: 980,
		shortName: "DTG 10mg",
		fullName: "Dolutegravir 10mg pack of 90 tablets",
		packSizes: [90]
	},
	{
		drugID: 982,
		shortName: "DTG 50mg",
		fullName: "Dolutegravir 50mg pack of 30 tablets",
		packSizes: [30]
	},
	{
		drugID: 30,
		shortName: "EFV 200mg",
		fullName: "Efavirenz 200mg, tin of 90 tablets",
		packSizes: [90]
	},
	{
		drugID: 11,
		shortName: "EFV 600mg",
		fullName: "Efavirenz 600mg, tin of 30 tablets"
		, packSizes: [30]
	},
	{
		drugID: 978,
		shortName: "ETV 100mg",
		fullName: "Etravirine 100mg, tin of 120 tablets"
		, packSizes: [120]
	},
	{
		drugID: 24,
		shortName: "Isoniazid 100mg",
		fullName: "Isoniazid (H) 100mg, blist packs of 100 tablets"
		, packSizes: [100]
	},
	{
		drugID: 991,
		shortName: "Isoniazid 300mg",
		fullName: "Isoniazid (H) 300mg, blist packs of 1000 tablets"
		, packSizes: [1000, 672]
	},
	{
		drugID: 74,
		shortName: "LPV 100 / r 25mg",
		fullName: "Lopinavir / Ritonavir 100 / 25mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 73,
		shortName: "LPV 200 / r 50mg",
		fullName: "Lopinavir / Ritonavir 200 / 50mg, tin of 120 tablets"
		, packSizes: [120]
	},
	{
		drugID: 1045,
		shortName: "LPV 40 / r 10mg granules",
		fullName: "Lopinavir/Ritonavir(LPV/r ), 40/10mg granules, pack of 120 sachets"
		, packSizes: [120]
	},
	{
		drugID: 979,
		shortName: "LPV 40 / r 10mg pellets",
		fullName: "Lopinavir/Ritonavir(LPV/r ), 40/10mg granules, pack of 120 pellets"
		, packSizes: [120]
	},
	{
		drugID: 22,
		shortName: "NVP 200mg",
		fullName: "Nevirapine 200mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 968,
		shortName: "NVP 50mg",
		fullName: "Nevirapine 50mg, tin of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 1039,
		shortName: "Pyridoxine 25mg",
		fullName: "Pyridoxine (25mg)"
		, packSizes: [1000]
	},
	{
		drugID: 977,
		shortName: "r 100mg",
		fullName: "Ritonavir 100mg pack of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 1043,
		shortName: "RAL 25mg",
		fullName: "Raltegravir 25mg pack of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 954,
		shortName: "RAL 400mg",
		fullName: "Raltegravir 400mg pack of 60 tablets"
		, packSizes: [60]
	},
	{
		drugID: 1056,
		shortName: "Rifapentine 150mg",
		fullName: "Rifapentine 150mg pack of 24 tablets"
		, packSizes: [24]
	},
	{
		drugID: 734,
		shortName: "TDF 300 / 3TC 300mg ",
		fullName: "Lamivudine / Tenofovir disoproxil fumarate 300 / 300mg, tin of 30 tablets"
		, packSizes: [30]
	},
	{
		drugID: 735,
		shortName: "TDF 300 / 3TC 300 / EFV 600mg",
		fullName: "Tenofovir disoproxil fumarate / Lamivudine / Efavirenz 300 / 300 / 600mg, tin of 30 tablets"
		, packSizes: [30]
	},
	{
		drugID: 983,
		shortName: "TDF 300 / 3TC 300 / DTG 50mg",
		fullName: "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir (TDF/3TC /DTG), 300/300/50mg, pack of 90 tablets"
		, packSizes: [90]
	}
] as any
export class StockService extends Service {
	constructor() {
		super()
	}
	postItems(items: any) {
		return Service.postJson('/pharmacy/batches', items);
	}
	getItems() {
		return Service.getJson('pharmacy/items', {paginate: false})
	}
	relocateItems(batchID: number, items: any) {
		return Service.postJson(`pharmacy/items/${batchID}/reallocate`, items)
	}
	disposeItems(batchID: number, items: any) {
		return Service.postJson(`pharmacy/items/${batchID}/dispose`, items)
	}
	drugList() {
		return finalList;
	}
	static getShortName(drugID: number){
		return finalList.filter(d => d.drugID === drugID)[0].shortName
	}
	static getPackSize(drugID: number){
		return finalList.filter(d => d.drugID === drugID)[0].packSizes[0]
	}
}

// var drugs: any = {};
// finalList.forEach(element => {
// 	drugs[element.drugID] = {
// 		shortName: element.shortName,
// 		fullName: element.fullName
// 	}
// });
// var drug_short_full_name = drugs;
// var drugCMSNames: any = {};
// finalList.forEach(element => {
// 	drugCMSNames[element.shortName] = element.fullName;
// });

// var drug_short_names: any = {};
// finalList.forEach(element => {
// 	drug_short_names[element.fullName] = element.shortName;
// });

// var drugs_unformatted = Object.keys(drug_short_names);
// var formatted_drugs = drugs_unformatted;
// var drug_map_hash: any = {};
// finalList.forEach(element => {
// 	drug_map_hash[element.drugID] = element.fullName;
// });

// export function getDrugPackSizes() {
// 	var drug_cms_packsizes: any = {};
// 	finalList.forEach(element => {
// 		drug_cms_packsizes[element.shortName] = element.packSizes[0];
// 	});
// 	return drug_cms_packsizes;
// }
// export function getPackSize(drug_id: any) {
// 	return finalList.filter((drug: any) => drug.drug_id === drug_id)[0].packSizes[0];
// }
//     var drug_weights = {
// 	"16": ["Lamivudine / Tenofovir disoproxil fumarate 300 / 300mg, tin of 30 tablets", "TDF/3TC (Tenofavir and Lamivudine 300/300mg tablet", "TDF / 3TC ", "30 tabs", 30, 0, "300 / 300mg"],
// 	"5": ["Zidovudine / lamivudine /Nevirapine 30 / 60 / 50mg, tin of 60 tablets", "AZT/3TC/NVP (60/30/50mg tablet)", "AZT / 3TC / NVP", "60 tabs", 60, 0, "60 / 30 /50mg"],
// 	"11": ["Lopinavir / Ritonavir 100 / 25mg, tin of 60 tablets", "LPV/r (Lopinavir and Ritonavir 100/25mg tablet)", "LPV / r ", "60 tabs", 60, 0, "100 / 25mg"],
// 	"17": ["Tenofovir disoproxil fumarate / Lamivudine / Efavirenz 300 / 300 / 600mg, tin of 30 tablets", "TDF/3TC/EFV (300/300/600mg tablet)", "TDF / 3TC / EFV ", "30 tabs", 30, 0, "300 / 300 / 600mg"],
// 	"6": ["Zidovudine / lamivudine /Nevirapine 300 / 150 / 200mg, tin of 60 tablets", "AZT/3TC/NVP (300/150/200mg tablet)", "AZT / 3TC / NVP", "60 tabs", 60, 0, "300 / 150 / 200mg"],
// 	"23": ["Cotrimoxazole 120mg, blister pack of 1000 dispersible tablets", "TMP/SMX (Cotrimoxazole 120mg tablet)", "Cotrimoxazole", "1000 tabs", 1000, 0, "100 / 20mg"],
// 	"1": ["Abacavir / Lamivudine 60 / 30mg, tin of 60 tablets", "ABC/3TC (Abacavir and Lamivudine 60/30mg tablet)", "ABC / 3TC", "60 tabs", 60, 0, "60 / 30mg"],
// 	"12": ["Lopinavir / Ritonavir 200 / 50mg, tin of 120 tablets", "LPV/r (Lopinavir and Ritonavir 200/50mg tablet)", "LPV / r ", "120 tabs", 120, 0, "200 / 50mg"],
// 	"7": ["Stavudine / lamivudine 30 / 150mg, tin of 60 tablets", "d4T/3TC (Stavudine Lamivudine 30/150 tablet)", "d4T/3TC", "60 tabs", 60, 0, "30 / 150mg"],
// 	"18": ["Nevirapine 10mg/ml, 25ml", "NVP (Nevirapine syrup 1.5mL/dose in 25mL bottle)", "NVP", "25ml", 25, 0, "10mg/ml"],
// 	"2": ["Abacavir sulfate 600mg / Lamivudine 300mg, tin of 30 tablets", "ABC/3TC (Abacavir and Lamivudine 600/300mg tablet)", "ABC / 3TC", "30 tabs", 30, 0, "600 / 300mg"],
// 	"13": ["Atazanavir / Ritonavir 300 / 100mg, tin of 30 tablets", "ATV/r (Atazanavir 300mg/Ritonavir 100mg)", "ATV / r ", "30 tabs", 30, 0, "300 / 100mg"],
// 	"24": ["Cotrimoxazole 480mg, tin of 1000 tablets", "Cotrimoxazole (480mg tablet)", "Cotrimoxazole", "1000 tabs", 1000, 0, "400 / 80mg"],
// 	"19": ["Nevirapine 10mg/ml, 100ml", "NVP (Nevirapine syrup 1mL/dose in 100mL bottle)", "NVP", "100ml", 100, 0, "10mg/ml"],
// 	"8": ["Lamivudine / Stavudine / Nevirapine 150 / 30 / 200mg, tin of 60 tablets", "d4T/3TC/NVP (30/150/200mg tablet)", "d4T/3TC/NVP", "60 tabs", 60, 0, "30 / 150 / 200mg"],
// 	"14": ["Nevirapine 50mg, tin of 60 tablets", "NVP (Nevirapine 50 mg tablet)", "NVP", "60 tabs", 60, 0, "50mg"],
// 	"3": ["Zidovudine / lamivudine 60 / 30mg, tin of 60 tablets", "AZT/3TC (Zidovudine and Lamivudine 60/30 tablet)", "AZT / 3TC", "60 tabs", 60, 0, "60 / 30mg"],
// 	"25": ["Cotrimoxazole 960mg, blister pack of 1000 tablets", "Cotrimoxazole (960mg)", "Cotrimoxazole", "1000 tabs", 1000, 0, "960mg"],
// 	"9": ["Efavirenz 200mg, tin of 90 tablets", "EFV (Efavirenz 200mg tablet)", "EFV", "90 tabs", 90, 0, "200mg"],
// 	"20": ["Isoniazid 100mg, tin of 100 tablets", "INH or H (Isoniazid 100mg tablet)", "Isoniazid (H) ", "100 tabs", 100, 0, "100mg"],
// 	"26": ["Pyridoxine 50mg tab, 1000 tablets", "Pyridoxine (50mg)", "Pyridoxine", "1000 tabs", 1000, 0, "50mg"],
// 	"4": ["Zidovudine / lamivudine 300 / 150mg, tin of 60 tablets", "AZT/3TC (Zidovudine and Lamivudine 300/150mg)", "AZT / 3TC", "60 tabs", 60, 0, "300 / 150mg"],
// 	"15": ["Nevirapine 200mg, tin of 60 tablets", "NVP (Nevirapine 200 mg tablet)", "NVP", "60 tabs", 60, 0, "200mg"],
// 	"21": ["Isoniazid 300mg, tin of 1000 tablets", "INH or H (Isoniazid 300mg tablet)", "Isoniazid (H) ", "1000 tabs", 1000, 0, "300mg"],
// 	// "26": ["ABC / 3TC 120 / 60mg 60 tabs", "ABC/3TC (Abacavir and Lamivudine 120/60mg tablet)", "ABC", "60 tabs", 60, 0, "600mg"],
// 	"27": ["Raltegravir 25mg, 60 tablets", "Raltegravir 25mg", "RAL", "60 tabs", 60, 0, "25mg"],
// 	"28": ["Raltegravir 400mg, 60 tablets", "Raltegravir 400mg", "RAL", "60 tabs", 60, 0, "400mg"],
// 	"29": ["Darunavir 600mg, 60 tablets", "Darunavir 600mg", "DRV", "60 tabs", 60, 0, "600mg"],
// 	"30": ["Dolutegravir 50mg 30 tablets", "Dolutegravir (50mg tablet)", "DTG", "30 tabs", 30, 0, "50mg"],
// 	"31": ["TDF300/3TC300/DTG50", "TDF300/3TC300/DTG50", "TDF300/3TC300/DTG50", "30 tabs", 30, 0, "300/300/50mg"],
// 	"32": ["Pyridoxine (25mg)", "Pyridoxine (25mg)", "Pyridoxine (25mg)", "1000 tabs", 1000, 0, "25mg"],
// 	"33": ["Ritonavir 100mg", "Ritonavir 100mg", "Ritonavir 100mg", "30 tabs", 30, 0, "100mg"],
//     };


//     var adults_drugs_hash = {
// 	"976": "Darunavir 600mg",
// 	"977": "Ritonavir 100mg",
// 	"978": "Etravirine 100mg",
// 	"954": "Raltegravir 400mg",
// 	"22": "NVP (Nevirapine 200 mg tablet)",
// 	"969": "ABC/3TC (Abacavir and Lamivudine 600/300mg tablet)",
// 	"731": "AZT/3TC/NVP (300/150/200mg tablet)",
// 	"39": "AZT/3TC (Zidovudine and Lamivudine 300/150mg)",
// 	"11": "EFV (Efavirenz 600mg tablet)",
// 	"735": "TDF/3TC/EFV (300/300/600mg tablet)",
// 	"734": "TDF/3TC (Tenofavir and Lamivudine 300/300mg tablet",
// 	"932": "ATV/r (Atazanavir 300mg/Ritonavir 100mg)",
// 	"73": "LPV/r (Lopinavir and Ritonavir 200/50mg tablet)",
// 	"576": "Cotrimoxazole (960mg)",
// 	"297": "Cotrimoxazole (480mg tablet)",
// 	"931": "INH or H (Isoniazid 300mg tablet)",
// 	"954": "Raltegravir 400mg",
// 	"1056": "Rifapentine 150mg",
// 	"976": "Darunavir 600mg",
// 	"982": "Dolutegravir (50mg tablet)",
// 	"983":  "TDF300/3TC300/DTG50",
// 	"1039":  "Pyridoxine (25mg)",
// 	"977":  "Ritonavir 100mg",
//     };

//     var paedsDrugsHash = {
// 	"733": "Abacavir / Lamivudine 60 / 30mg, tin of 60 tablets",
// 	"968": "Nevirapine 50mg, tin of 60 tablets",
// 	"732": "Zidovudine / lamivudine /Nevirapine 30 / 60 / 50mg, tin of 60 tablets",
// 	"736": "Zidovudine / lamivudine 60 / 30mg, tin of 60 tablets",
// 	"30": "Efavirenz 200mg, tin of 90 tablets",
// 	"74": "Lopinavir / Ritonavir 100 / 25mg, tin of 60 tablets",
// 	"979": "LPV/r pellets",
// 	"963": "Cotrimoxazole 120mg, blister pack of 1000 dispersible tablets",
// 	"24": "Isoniazid 100mg, tin of 100 tablets",
// 	"1044": "ABC/3TC (Abacavir and Lamivudine 120/60mg tablet)",
// 	"1043": "Raltegravir 25mg",
//     };