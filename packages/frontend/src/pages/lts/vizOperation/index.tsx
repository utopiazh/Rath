import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite'
import styled from 'styled-components';
import { useGlobalStore } from '../../../store';
import { CommandBarButton, Stack, IContextualMenuProps, Panel, PanelType } from 'office-ui-fabric-react';
import ViewField from './viewField';
import BaseChart from '../../../visBuilder/vegaBase';
import Association from '../association';
import ConstraintsPanel from './constraints';
import { PIVOT_KEYS } from '../../../constants';
import intl from 'react-intl-universal';

const FieldsContainer = styled.div`
    margin-top: 1em;
    margin-bottom: 1em;
    display: flex;
`

const VizOperation: React.FC = props => {
    const { exploreStore, dataSourceStore, ltsPipeLineStore, commonStore } = useGlobalStore();
    const { forkView, visualConfig, showAsso } = exploreStore
    const { dimFields, meaFields } = dataSourceStore;
    const { fieldMetas } = ltsPipeLineStore
    const dimensionOptions: IContextualMenuProps = {
        items: dimFields.map(f => ({
            key: f.fid,
            text: f.name,
            onClick: (e) => { exploreStore.addFieldToForkView('dimensions', f.fid) }
        }))
    }
    const measureOptions: IContextualMenuProps = {
        items: meaFields.map(f => ({
            key: f.fid,
            text: f.name,
            onClick: (e) => { exploreStore.addFieldToForkView('measures', f.fid) }
        }))
    }

    const customizeAnalysis = useCallback(() => {
        exploreStore.bringToGrphicWalker();
        commonStore.setAppKey(PIVOT_KEYS.editor)
    }, [exploreStore, commonStore])

    const forkViewSpec = exploreStore.forkViewSpec;
    if (forkView !== null) {
        return <div>
            <Stack horizontal>
                <CommandBarButton menuProps={dimensionOptions} text={intl.get('common.dimension')} iconProps={{ iconName: 'AddTo' }} />
                <CommandBarButton menuProps={measureOptions} text={intl.get('common.measure')} iconProps={{ iconName: 'AddTo' }} />
                <CommandBarButton text={intl.get('lts.commandBar.editing')} iconProps={{ iconName: 'BarChartVerticalEdit' }} onClick={customizeAnalysis} />
                <CommandBarButton text={intl.get('lts.commandBar.associate')} iconProps={{ iconName: 'Lightbulb' }} onClick={() => {
                    exploreStore.getAssociatedViews();
                }} />
                <CommandBarButton text={intl.get('lts.commandBar.constraints')} iconProps={{ iconName: 'MultiSelect' }} onClick={() => {
                    exploreStore.setShowContraints(true);
                }} />
            </Stack>
            <FieldsContainer>
                {forkView.dimensions.map(f => {
                    const field = dimFields.find(d => d.fid === f);
                    return <ViewField type="dimension"
                        text={(field ? field.name : f) || f}
                        key={f}
                        onRemove={() => {
                            exploreStore.removeFieldFromForkView('dimensions', f)
                        }}
                    />
                })}
            </FieldsContainer>
            <FieldsContainer>
                {forkView.measures.map((f, fIndex) => {
                    const field = meaFields.find(d => d.fid === f);
                    return <ViewField
                        type="measure" text={`${(field ? field.name : f) || f}${visualConfig.defaultAggregated ? `(${forkView.ops[fIndex]})` : ''}`}
                        key={f}
                        onRemove={() => {
                            exploreStore.removeFieldFromForkView('measures', f)
                        }}
                    />
                })}
            </FieldsContainer>
            <Panel isOpen={showAsso}
                type={PanelType.medium}
                onDismiss={() => {
                    exploreStore.setShowAsso(false);
            }}>
                <Association />
            </Panel>
            <ConstraintsPanel />
            {
                forkViewSpec && <BaseChart
                    defaultAggregated={visualConfig.defaultAggregated}
                    defaultStack={visualConfig.defaultStack}
                    dimensions={forkView.dimensions}
                    measures={forkView.measures}
                    dataSource={visualConfig.defaultAggregated ? forkViewSpec.dataView : ltsPipeLineStore.dataSource}
                    schema={forkViewSpec.schema}
                    fieldFeatures={fieldMetas}
                    aggregator={visualConfig.aggregator}
                />
            }
        </div>
    } else {
        return <div></div>
    }
}

export default observer(VizOperation)
