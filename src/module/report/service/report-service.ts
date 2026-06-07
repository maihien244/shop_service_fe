import { ApiClient, type HttpClient } from "#/lib/http.client";
import type { ReportType } from "../dto";
export class ReportParams {
    type!: keyof typeof ReportType
    fromDate!: string
    toDate!: string
}

export class TonKhoReport extends ReportParams {
    warehouseId?: string
}

export class ReportService {
    protected apiClient: HttpClient
    private baseUrl: string = "/v1/admin/reports"

    constructor() {
        this.apiClient = ApiClient
    }

    public async getReport<T>(params: ReportParams) : Promise<T> {
        return await this.apiClient.get<T> (`${this.baseUrl}`, {
            params
        })
    }
}