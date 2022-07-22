export type CaseType = 'ban' | 'kick' | 'warn'

export interface caseInterface {
    type: CaseType
    userID: string
    gid: string
    reason: string
    date: string
    id: number
    moderatorID: string
}