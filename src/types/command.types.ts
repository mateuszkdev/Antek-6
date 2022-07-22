import { EmojiIdentifierResolvable, BitFieldResolvable, ColorResolvable, PermissionString, Message, TextChannel, MessageActionRow, MessageButton, Collection, ReactionEmoji, MessageButtonStyleResolvable, Interaction, MessageComponentInteraction, InteractionCollector } from 'discord.js'

export type Field = [string, string?, boolean?]
export type PermissionsName = BitFieldResolvable<PermissionString, bigint>

export interface CustomButton {
    text: string
    id: string
    style: MessageButtonStyleResolvable
    emoji?: EmojiIdentifierResolvable
    url?: string

}

export type ButtonCollector = { id: string, execute: (i?: Interaction, collector?: InteractionCollector<MessageComponentInteraction>) => void }

export interface commandOutput {

    author?: string[],
    color?: ColorResolvable,
    text?: string,
    footer?: string[],
    thumbnail?: string,
    timestamp?: Date | Number,
    image?: string
    field?: Field
    fields?: Field[]
    channel?: TextChannel | any
    delete?: number
    error?: string

    // components 

    closeButton?: boolean
    customButtons?: CustomButton[]
    buttonCollectors?: ButtonCollector[]

}

export interface commandArguments {
    message?: Message
    args?: string[]
}

export abstract class Command {
    // first - name, another - aliases
    executors: string[]
    description?: string
    permissons?: PermissionsName[]
    dev?: boolean
    usage?: string
    category: string
    disable?: boolean

    abstract run({}: commandArguments): Promise<commandOutput | void>

}