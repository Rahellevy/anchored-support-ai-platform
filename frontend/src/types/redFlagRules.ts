export type Severity = 'High' | 'Medium' | 'Low'
export type MatchType = 'phrase' | 'llm'

export interface RedFlagRule {
    id: number
    name: string
    pattern: string
    matchType: MatchType
    severity: Severity
    enabled: boolean
    createdAt: string
}

export interface createRedFlagRuleRequest {
    name: string
    pattern: string
    matchType: MatchType
    severity: Severity
}

export interface updateRedFlagRuleRequest {
    id: number,
    name: string
    pattern: string
    matchType: MatchType
    severity: Severity
}


