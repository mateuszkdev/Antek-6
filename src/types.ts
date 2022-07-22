export interface AntekConfig {
    prefix: string
    prefixBeta: string
    token: string
    totalShards: number
    devsIDs: string[]
    logs: {
        webhookID: string
        webhookToken: string
    }
    boxPrice: {
        standard: number
        premium: number
    }
}

export * from './types/casemanager.types'
export * from './types/command.types'
export * from './types/items.types'
export * from './types/economy.types'
export * from './types/snipe.types'