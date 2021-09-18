import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icon } from '@/components/common/Icon'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useCrystalWallet } from '@/stores/CrystalWalletService'
import { amount, sliceAddress } from '@/utils'

import './index.scss'


export function CrystalWallet(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useCrystalWallet()

    return (
        <Observer>
            {() => (wallet.isInitialized ? (
                <div key="crystal-wallet" className="wallet">
                    {!wallet.isConnected ? (
                        <button
                            key="guest"
                            type="button"
                            className="btn btn-secondary"
                            disabled={wallet.isConnecting}
                            aria-disabled={wallet.isConnecting}
                            onClick={wallet.connect}
                        >
                            {intl.formatMessage({
                                id: 'CRYSTAL_WALLET_CONNECT_BTN_TEXT',
                            })}
                        </button>
                    ) : (
                        <div key="wrapper" className="wallet__wrapper">
                            <div className="wallet__user-avatar">
                                <UserAvatar
                                    address={wallet.address!}
                                    size="small"
                                />
                                <div className="wallet-icon">
                                    <Icon icon="tonWalletIcon" />
                                </div>
                            </div>
                            <div className="wallet__info">
                                <div className="wallet__address">
                                    {sliceAddress(wallet.address)}
                                </div>
                                {wallet.balance !== undefined && (
                                    <div key="balance" className="wallet__balance">
                                        {intl.formatMessage({
                                            id: 'WALLET_BALANCE_HINT',
                                        }, {
                                            value: amount(
                                                wallet.balance,
                                                9,
                                            ) || 0,
                                            currency: 'TON',
                                        })}
                                    </div>
                                )}
                            </div>

                            <button
                                key="logout"
                                type="button"
                                className="btn btn-logout"
                                onClick={wallet.disconnect}
                            >
                                <Icon icon="logout" />
                            </button>
                        </div>
                    )}
                </div>
            ) : null)}
        </Observer>
    )
}