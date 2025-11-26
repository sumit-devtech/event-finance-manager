import { Injectable } from "@nestjs/common";

@Injectable()
export class BudgetVsActualGenerator {
  async generate(eventData: any): Promise<any> {
    // Generate budget vs actual report
    // In production, this would generate PDF/Excel files
    return {
      eventName: eventData.name,
      budget: eventData.budgetTotal,
      actual: eventData.actualTotal,
      variance: eventData.actualTotal - eventData.budgetTotal,
      lineItems: eventData.lineItems || [],
    };
  }
}

