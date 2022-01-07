import { Service } from "./service";
import ConceptNameDictionary from "@/Data/ConceptNameDictionary"; 

export class ConceptService extends Service {
    constructor() {
        super()
    }

    static getConceptsByCategory(categoryName: string) {
        return ConceptNameDictionary.filter((i: any) => {
            return i.categories.includes(categoryName)
        })
    }

    static async getConceptName(conceptId: number) {
        const concept = this.getCachedConceptName(conceptId)

        if (concept) return concept

        return this.getConceptNameFromApi(conceptId)
    }

    static getConceptID(conceptName: string, strictMode=false) {
        try {
            return this.getCachedConceptID(conceptName, strictMode)
        } catch (e) {
            return this.getConceptIDFromApi(conceptName)
        }
    }

    static getCachedConceptID(conceptName: string, strictMode=false) {
        const concepts = ConceptNameDictionary.filter(item => {
           if (!strictMode) return item.name.match(new RegExp(conceptName, 'i'))

           return item.name === conceptName
        })
        return this.resolveConcept(concepts, conceptName)
    }

    static async getConceptIDFromApi(name: string) {
        const concepts = await super.getJson(`concepts`, {name})
        return this.resolveConcept(concepts, name)
    }
    
    static async getConceptNameFromApi(conceptId: number) {
        const concept = await super.getJson(`concepts/${conceptId}`)

       
        if (concept) return concept.concept_names[0].name
    }

    static getCachedConceptName(conceptId: number) {
        const concepts = ConceptNameDictionary.filter(item => {
            return item.concept_id === conceptId
        })
        
        if (concepts.length >= 1) return concepts[0].name
    }

    private static resolveConcept(concepts: any, conceptName: string) {
        if (concepts.length === 1) return concepts[0].concept_id

        throw `Concept name ${conceptName} was not found or has a duplicates`
    }
}