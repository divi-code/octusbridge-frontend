import { ETH_ADDRESS_REGEXP, TON_PUBLIC_KEY_REGEXP } from '@/modules/Relayers/constants'
import { IndexerApiBaseUrl, networks } from '@/config'
import { handleApi } from '@/utils'
import {
    RelayersEventsParams, RelayersEventsResponse, RelayersEventsTransferKind,
    RelayersSearchParams, RelayersSearchResponse, RelayInfoParams,
    RelayInfoResponse, RelayRoundInfoParams,
    RelayRoundInfoResponse, RelayRoundsInfoRequest, RelayRoundsInfoResponse,
    RelaysRoundInfoRequest, RelaysRoundInfoResponse, RoundInfoParams, RoundInfoResponse,
    RoundsCalendarParams, RoundsCalendarResponse, RoundStatus,
} from '@/modules/Relayers/types'
import { NetworkShape } from '@/types'

function normalizeKey(pattern: RegExp, value: string): string {
    const result = value.toLowerCase()
    const match = value.match(pattern)

    if (!match) {
        return result
    }

    return match[1] ? result : `0x${result}`
}

export function normalizeTonPubKey(value: string): string {
    return normalizeKey(TON_PUBLIC_KEY_REGEXP, value)
}

export function normalizeEthAddress(value: string): string {
    return normalizeKey(ETH_ADDRESS_REGEXP, value)
}

export function handleRelayers(params: RelayersSearchParams): Promise<RelayersSearchResponse> {
    return handleApi<RelayersSearchResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/search/relays`,
        data: params,
    })
}

export function handleRoundInfo(params: RoundInfoParams): Promise<RoundInfoResponse> {
    return handleApi<RoundInfoResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/round_info`,
        data: params,
    })
}

export function handleRelayRoundInfo(params: RelayRoundInfoParams): Promise<RelayRoundInfoResponse> {
    return handleApi<RoundInfoResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/relay_round_info`,
        data: params,
    })
}

export function handleRoundsCalendar(params: RoundsCalendarParams): Promise<RoundsCalendarResponse> {
    return handleApi<RoundsCalendarResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/rounds_calendar`,
        data: params,
    })
}

export function handleRelayInfo(params: RelayInfoParams): Promise<RelayInfoResponse> {
    return handleApi<RelayInfoResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/relay_info`,
        data: params,
    })
}

export function handleRelayersEvents(params: RelayersEventsParams): Promise<RelayersEventsResponse> {
    return handleApi<RelayersEventsResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/search/relays_events`,
        data: params,
    })
}

export function handleRelayRoundsInfo(params: RelayRoundsInfoRequest): Promise<RelayRoundsInfoResponse> {
    return handleApi<RelayRoundsInfoResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/relay_rounds_info`,
        data: params,
    })
}

export function handleRelaysRoundInfo(params: RelaysRoundInfoRequest): Promise<RelaysRoundInfoResponse> {
    return handleApi<RelaysRoundInfoResponse>({
        url: `${IndexerApiBaseUrl}/relays_pages/relays_round_info`,
        data: params,
    })
}

export function getRoundStatus(startTime: number, endTime: number): RoundStatus {
    const date = Date.now()

    if (startTime <= date && endTime > date) {
        return 'active'
    }

    if (endTime <= date) {
        return 'finished'
    }

    return 'waiting'
}

const evmNetworks = networks
    .filter(item => item.type === 'evm')
    .reduce<{[k: string]: NetworkShape | undefined}>((acc, item) => ({
        ...acc,
        [item.chainId]: item,
    }), {})

const tonNetworks = networks
    .filter(item => item.type === 'everscale')
    .reduce<{[k: string]: NetworkShape | undefined}>((acc, item) => ({
        ...acc,
        [item.chainId]: item,
    }), {})

function getEvmName(chainId: number): string | undefined {
    return evmNetworks[chainId]?.currencySymbol
}

export function getEventFromName(transferKind: RelayersEventsTransferKind, chainId: number): string | undefined {
    if (transferKind === 'tontoeth') {
        return tonNetworks[1]?.currencySymbol
    }
    if (transferKind === 'ethtoton' || transferKind === 'creditethtoton') {
        return getEvmName(chainId)
    }
    return undefined
}

export function getEventToName(transferKind: RelayersEventsTransferKind, chainId: number): string | undefined {
    if (transferKind === 'ethtoton' || transferKind === 'creditethtoton') {
        return tonNetworks[1]?.currencySymbol
    }
    if (transferKind === 'tontoeth') {
        return getEvmName(chainId)
    }
    return undefined
}
