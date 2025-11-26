import { Injectable } from "@nestjs/common";

@Injectable()
export class VendorReportGenerator {
  async generate(eventData: any): Promise<any> {
    // Generate vendor summary report
    return {
      eventName: eventData.name,
      vendors: eventData.vendors || [],
      totalVendorSpend: eventData.totalVendorSpend || 0,
    };
  }
}

