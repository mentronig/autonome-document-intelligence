import { T2Analyzer, AnalysisResult } from '../skills/reasoning/t2-analyzer';
import { T2Evaluator } from '../skills/evaluation/t2-evaluator';

export class ReflexionEngine {
  private analyzer: T2Analyzer;
  private evaluator: T2Evaluator;
  private maxRetries: number;

  constructor(analyzer: T2Analyzer, evaluator: T2Evaluator, maxRetries: number = 3) {
    this.analyzer = analyzer;
    this.evaluator = evaluator;
    this.maxRetries = maxRetries;
  }

  async run(text: string): Promise<AnalysisResult> {
    let currentResult: AnalysisResult | null = null;
    let critique: string | null = null;
    let attempt = 0;

    while (attempt < this.maxRetries) {
      console.log(`\n--- Reflexion Loop: Attempt ${attempt + 1}/${this.maxRetries} ---`);

      // 1. Actor (Analyze)
      // context includes previous critique
      const context = critique
        ? `Previous attempt failed. CRITIQUE:\n${critique}\nPlease fix these issues.`
        : '';
      currentResult = await this.analyzer.analyze(text, context);

      console.log(
        'Analysis Result Candidates:',
        `PBIs: ${currentResult.pbis.length}, CRs: ${currentResult.crs.length}`,
      );

      // 2. Evaluator
      critique = this.evaluator.evaluate(currentResult);

      if (!critique) {
        console.log('Evaluation Passed! ✅');
        return currentResult;
      }

      console.log('Evaluation Failed ❌. Critique:', critique);
      attempt++;
    }

    console.warn('Max retries reached. Returning last best effort.');
    if (!currentResult) {
      throw new Error('Reflexion loop failed to produce any result.');
    }
    return currentResult;
  }
}
