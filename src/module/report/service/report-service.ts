import { ApiClient, type HttpClient } from "#/lib/http.client";
import type { ReportType } from "../dto";

export type ReportParams = {
    type: keyof typeof ReportType
    fromDate: string
    toDate: string
}

export class ReportService {
    protected apiClient : HttpClient
    private baseUrl: string = "/v1/admin/reports"

    constructor() {
        this.apiClient = ApiClient
    }

    public async getReport(params: ReportParams) : Promise<Record<string, any>> {
        return await this.apiClient.get<Record<string, any>> (`${this.baseUrl}`, {
            params
        })
    }
}