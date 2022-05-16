import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import {
    DateFilter, FilterField, Filters, NUM_REGEXP, TextFilter,
} from '@/components/common/Filters'
import { Align, Table } from '@/components/common/Table'
import { Header, Section, Title } from '@/components/common/Section'
import { Pagination } from '@/components/common/Pagination'
import { UserCard } from '@/components/common/UserCard'
import { Status } from '@/modules/Relayers/components/Relayers/status'
import { Rounds } from '@/modules/Relayers/components/Relayers/rounds'
import { useRelayersContext } from '@/modules/Relayers/providers'
import { RelayersSearchFilters, RelayersSearchOrdering } from '@/modules/Relayers/types'
import { dateFormat, formattedAmount } from '@/utils'
import {
    useBNParam, useDateParam, usePagination, useTableOrder, useUrlParams,
} from '@/hooks'

import './index.scss'

type Props = {
    soon?: boolean;
    roundNum?: number;
    transferContractAddress?: string;
}

export function RelayersInner({
    soon,
    roundNum,
    transferContractAddress,
}: Props): JSX.Element {
    const intl = useIntl()
    const relayers = useRelayersContext()
    const urlParams = useUrlParams()
    const pagination = usePagination(relayers.totalCount)
    const tableOrder = useTableOrder<RelayersSearchOrdering>('stakedescending')

    const [createdAtGe] = useDateParam('created-ge')
    const [createdAtLe] = useDateParam('created-le')
    const [stakeGe] = useBNParam('stake-ge')
    const [stakeLe] = useBNParam('stake-le')

    const changeFilters = (filters: RelayersSearchFilters) => {
        pagination.submit(1)

        urlParams.set({
            'created-ge': filters.createdAtGe?.toString(),
            'created-le': filters.createdAtLe?.toString(),
            'stake-ge': filters.stakeGe?.toString(),
            'stake-le': filters.stakeLe?.toString(),
        })
    }

    React.useEffect(() => {
        relayers.fetch({
            transferContractAddress,
            roundNum,
            stakeGe,
            stakeLe,
            createdAtGe,
            createdAtLe,
            limit: pagination.limit,
            offset: pagination.offset,
            ordering: tableOrder.order,
        })
    }, [
        transferContractAddress,
        roundNum,
        stakeGe,
        stakeLe,
        createdAtGe,
        createdAtLe,
        pagination.offset,
        pagination.limit,
        tableOrder.order,
    ])

    return (
        <Section>
            <Header>
                <Title>
                    {intl.formatMessage({
                        id: 'RELAYERS_TITLE',
                    })}
                </Title>

                <Filters
                    filters={{
                        stakeGe,
                        stakeLe,
                        createdAtGe,
                        createdAtLe,
                    }}
                    onChange={changeFilters}
                >
                    {(localFilters, changeLocalFilter) => (
                        <>
                            <FilterField
                                title={intl.formatMessage({
                                    id: 'RELAYERS_RELAYER_SINCE',
                                })}
                            >
                                <DateFilter
                                    onChange={changeLocalFilter('createdAtGe')}
                                    value={localFilters.createdAtGe}
                                />
                                <DateFilter
                                    onChange={changeLocalFilter('createdAtLe')}
                                    value={localFilters.createdAtLe}
                                />
                            </FilterField>
                            <FilterField
                                title={intl.formatMessage({
                                    id: 'RELAYERS_STAKE',
                                })}
                            >
                                <TextFilter
                                    value={localFilters.stakeGe}
                                    onChange={changeLocalFilter('stakeGe')}
                                    regexp={NUM_REGEXP}
                                    placeholder={intl.formatMessage({
                                        id: 'FILTERS_FROM',
                                    })}
                                />
                                <TextFilter
                                    value={localFilters.stakeLe}
                                    onChange={changeLocalFilter('stakeLe')}
                                    regexp={NUM_REGEXP}
                                    placeholder={intl.formatMessage({
                                        id: 'FILTERS_TO',
                                    })}
                                />
                            </FilterField>
                        </>
                    )}
                </Filters>
            </Header>

            <div className="card card--flat card--small">
                <Table
                    soon={soon}
                    onSort={tableOrder.onSort}
                    order={tableOrder.order}
                    loading={relayers.isLoading}
                    className="relayers-table"
                    cols={[{
                        name: '#',
                    }, {
                        name: intl.formatMessage({
                            id: 'RELAYERS_RELAYER',
                        }),
                    }, {
                        name: intl.formatMessage({
                            id: 'RELAYERS_STAKE',
                        }),
                        align: Align.right,
                        ascending: 'stakeascending',
                        descending: 'stakedescending',
                    }, {
                        name: intl.formatMessage({
                            id: 'RELAYERS_SLASHED',
                        }),
                        align: Align.right,
                    }, {
                        name: intl.formatMessage({
                            id: 'RELAYERS_CURRENT_ROUND',
                        }),
                        align: Align.right,
                    }, {
                        name: intl.formatMessage({
                            id: 'RELAYERS_SUCCESSFUL_ROUNDS',
                        }),
                        align: Align.right,
                    }, {
                        name: intl.formatMessage({
                            id: 'RELAYERS_RELAYER_SINCE',
                        }),
                        align: Align.right,
                        ascending: 'createdatascending',
                        descending: 'createdatdescending',
                    }]}
                    rows={relayers.relayers.map((item, index) => ({
                        cells: [
                            index + pagination.offset + 1,
                            <UserCard
                                address={item.relayAddress}
                                link={`/relayers/${item.relayAddress}`}
                            />,
                            formattedAmount(item.stake),
                            <Status
                                state={item.slashed ? 'fail' : 'success'}
                                status={item.slashed ? 'yes' : 'no'}
                            />,
                            <Status
                                state={item.currentRound ? 'success' : 'fail'}
                                status={item.currentRound ? 'active' : 'no'}
                            />,
                            <Rounds
                                amount={item.successfulRounds}
                                total={item.totalRounds}
                            />,
                            dateFormat(item.createdAt),
                        ],
                    }))}
                />

                {!soon && (
                    <Pagination
                        page={pagination.page}
                        count={pagination.limit}
                        totalCount={pagination.totalCount}
                        totalPages={pagination.totalPages}
                        onSubmit={pagination.submit}
                    />
                )}
            </div>
        </Section>
    )
}

export const Relayers = observer(RelayersInner)