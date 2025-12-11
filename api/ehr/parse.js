const fs = require('fs');
const path = require('path');
const readline = require('readline');

module.exports = async (req, res) => {
    try {
        const dataDir = path.join(process.cwd(), 'data', 'fhir');
        
        // 1. Find the file dynamically
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.jsonl') || f.endsWith('.json'));
        if (files.length === 0) {
            return res.status(404).json({ error: 'No FHIR data found in data/fhir' });
        }
        
        const filePath = path.join(dataDir, files[0]); // Take the first file found
        
        // 2. Stream & Parse
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const clinicalData = {
            vitals: [], // Weight, BP, HR
            labResults: [], // Lipids, A1C, Metabolic
            conditions: [], // Diagnoses
            medications: [] // Active meds
        };

        // LOINC Codes Mapping (Common US Standard)
        const LOINC = {
            '29463-7': 'Weight', '3141-9': 'Weight',
            '85354-9': 'Blood Pressure', '55284-4': 'Blood Pressure',
            '8867-4': 'Heart Rate',
            '4548-4': 'HbA1c', '17856-6': 'HbA1c',
            '2085-9': 'HDL Cholesterol',
            '13457-7': 'LDL Cholesterol', '2089-1': 'LDL Cholesterol',
            '2093-3': 'Total Cholesterol',
            '2571-8': 'Triglycerides',
            '2345-7': 'Glucose', '2339-0': 'Glucose'
        };

        for await (const line of rl) {
            try {
                if (!line.trim()) continue;
                const resource = JSON.parse(line);
                
                // We only care about the resource itself
                 // Fasten bundle format: { resource: { ... } } or just { user_resource: { ... } } or direct FHIR
                 // Usually it's in a wrapper. Let's inspect typical structure safely.
                 const r = resource.resource || resource; 

                if (r.resourceType === 'Observation') {
                     // Check LOINC code
                     const code = r.code?.coding?.find(c => c.system?.includes('loinc.org'))?.code;
                     const display = r.code?.text || r.code?.coding?.[0]?.display;
                     
                     if (code && LOINC[code]) {
                         const value = r.valueQuantity ? `${r.valueQuantity.value} ${r.valueQuantity.unit}` : (r.valueString || 'N/A');
                         
                         const entry = {
                             type: LOINC[code], // Normalized Name
                             date: r.effectiveDateTime,
                             value: r.valueQuantity?.value || null,
                             unit: r.valueQuantity?.unit || '',
                             rawDisplay: display
                         };

                         if (['HbA1c', 'LDL Cholesterol', 'HDL Cholesterol', 'Total Cholesterol', 'Triglycerides', 'Glucose'].includes(entry.type)) {
                            clinicalData.labResults.push(entry);
                         } else {
                            clinicalData.vitals.push(entry);
                         }
                     }
                }
                
                if (r.resourceType === 'Condition' && r.clinicalStatus?.coding?.[0]?.code === 'active') {
                     clinicalData.conditions.push({
                         name: r.code?.text,
                         date: r.onsetDateTime
                     });
                }

            } catch (err) {
                console.error('Error parsing line:', err);
            }
        }

        // 3. Sort by date desc
        clinicalData.labResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        clinicalData.vitals.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(clinicalData);

    } catch (error) {
        console.error('FHIR Parse Error:', error);
        res.status(500).json({ error: 'Failed to process EHR data' });
    }
};
