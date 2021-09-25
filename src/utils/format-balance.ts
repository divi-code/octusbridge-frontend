import BigNumber from 'bignumber.js'

import { amount } from '@/utils/amount'


export function formatBalance(
    value?: BigNumber.Value,
    decimals?: number,
): string {
    const balance = new BigNumber(value || 0).toFixed()
    return amount(balance, decimals)
}
