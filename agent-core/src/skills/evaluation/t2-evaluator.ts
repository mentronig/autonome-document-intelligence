import { AnalysisResult } from '../reasoning/t2-analyzer';

export class T2Evaluator {
  evaluate(result: AnalysisResult): string | null {
    const critiques: string[] = [];

    // Rule 1: Validate PBI IDs
    const pbiRegex = /PBI-\d{6}/;
    result.pbis.forEach((pbi) => {
      if (!pbiRegex.test(pbi.id)) {
        critiques.push(
          `Invalid PBI ID format: '${pbi.id}'. Expected format 'PBI-xxxxxx' (6 digits).`,
        );
      }
      if (!pbi.description || pbi.description.length < 10) {
        critiques.push(`PBI '${pbi.id}' has a description that is too short or missing.`);
      }
    });

    // Rule 2: Validate CR IDs
    const crRegex = /CR-\d{3,4}/;
    result.crs.forEach((cr) => {
      if (!crRegex.test(cr)) {
        critiques.push(`Invalid CR ID format: '${cr}'. Expected format 'CR-xxxx'.`);
      }
    });

    // Rule 3: Check for empty results
    if (result.pbis.length === 0 && result.crs.length === 0) {
      critiques.push('No PBIs or CRs were found. Please double-check the text.');
    }

    if (critiques.length > 0) {
      return critiques.join('\n');
    }
    return null;
  }
}
