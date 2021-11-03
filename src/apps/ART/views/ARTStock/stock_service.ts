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
		return Service.getJson('pharmacy/items', { paginate: false })
	}
	getItem(drugID: number) {
		return Service.getJson('pharmacy/items', { 'drug_id': drugID })
	}
	updateItem(batchID: number, vals: any) {
		return Service.putJson(`pharmacy/items/${batchID}`, vals)
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
	static getShortName(drugID: number) {
		return finalList.filter(d => d.drugID === drugID)[0].shortName
	}
	static getPackSize(drugID: number) {
		return finalList.filter(d => d.drugID === drugID)[0].packSizes[0]
	}
	// Waiting to get new list of paediatric drugs and adult drugs
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
}