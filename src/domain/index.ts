
export interface RemoteSearchResponse {
	results: {
		incident: {
			meta: {
				id: string,
				easyId: string | null,
				tenantId: string,
				createdAt: string | null,
				installId: string,
				sessionId: string,
				platform: string | null,
				application: string | null,
				clientVersion: string | null,
				lang: string | null,
				clientCapabilities: string[],
				ingestedAt: string,
				accounts: any[],
				purgeCompletedAt: string | null
			},
			analysis: {
				id: string,
				createdAt: string,
				classifications: string[],
				remedy: string | null,
				prescriptionLog: {
					remedyEvents: any[],
					generalEvents: any[]
				}
			}
		},
		issueBrief: string | null
	}[]
}