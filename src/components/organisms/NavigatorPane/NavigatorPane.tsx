import {useCallback, useMemo} from 'react';

import {Dropdown, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {DisabledAddResourceTooltip, NewResourceTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseResourceKinds, expandResourceKinds, toggleResourceFilters} from '@redux/reducers/ui';
import {navigatorResourceKindsSelector} from '@redux/selectors/resourceMapSelectors';

import {CheckedResourcesActionsMenu, ResourceFilter} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {useNewResourceMenuItems} from '@hooks/menuItemsHooks';

import {useRefSelector} from '@utils/hooks';

import {Icon, TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

import NavigatorDescription from './NavigatorDescription';
import * as S from './NavigatorPane.styled';
import ResourceNavigator from './ResourceNavigator';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);

  const newResourceMenuItems = useNewResourceMenuItems();

  const isAddResourceDisabled = useMemo(
    () => !isFolderOpen || isInPreviewMode || isInClusterMode,
    [isFolderOpen, isInClusterMode, isInPreviewMode]
  );

  const resourceFilterButtonHandler = useCallback(() => {
    dispatch(toggleResourceFilters());
  }, [dispatch]);

  const isHighlighted = useMemo(
    () => Boolean(highlightedItems.createResource || highlightedItems.browseTemplates),
    [highlightedItems.browseTemplates, highlightedItems.createResource]
  );

  return (
    <S.NavigatorPaneContainer>
      {checkedResourceIdentifiers.length && !isPreviewLoading ? (
        <S.SelectionBar>
          <CheckedResourcesActionsMenu />
        </S.SelectionBar>
      ) : (
        <TitleBarWrapper $navigator>
          <TitleBar
            type="secondary"
            title="Kubernetes Resources"
            description={<NavigatorDescription />}
            descriptionStyle={{paddingTop: '5px'}}
            actions={
              <S.TitleBarRightButtons>
                <CollapseAction />

                <Dropdown
                  trigger={['click']}
                  menu={{items: newResourceMenuItems}}
                  overlayClassName="dropdown-secondary"
                  disabled={isAddResourceDisabled}
                >
                  <Tooltip
                    mouseEnterDelay={TOOLTIP_DELAY}
                    title={
                      isAddResourceDisabled
                        ? DisabledAddResourceTooltip({
                            type: isInClusterMode ? 'cluster' : isInPreviewMode ? 'preview' : 'other',
                          })
                        : NewResourceTooltip
                    }
                  >
                    <S.PlusButton
                      id="create-resource-button"
                      $disabled={isAddResourceDisabled}
                      $highlighted={isHighlighted}
                      className={isHighlighted ? 'animated-highlight' : ''}
                      disabled={isAddResourceDisabled}
                      icon={<PlusOutlined />}
                      size="small"
                      type="link"
                    />
                  </Tooltip>
                </Dropdown>
              </S.TitleBarRightButtons>
            }
          />
        </TitleBarWrapper>
      )}

      <ResourceFilter active={isResourceFiltersOpen} onToggle={resourceFilterButtonHandler} />

      <S.List id="navigator-sections-container">
        <ResourceNavigator />
      </S.List>
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;

function CollapseAction() {
  const dispatch = useAppDispatch();
  const navigatorKinds = useRefSelector(navigatorResourceKindsSelector);
  const collapsedKinds = useRefSelector(s => s.ui.navigator.collapsedResourceKinds);

  const onClick = useCallback(() => {
    if (collapsedKinds.current.length === navigatorKinds.current.length) {
      dispatch(expandResourceKinds(navigatorKinds.current));
      trackEvent('navigator/expand_all');
      return;
    }
    dispatch(collapseResourceKinds(navigatorKinds.current));
    trackEvent('navigator/collapse_all');
  }, [dispatch, collapsedKinds, navigatorKinds]);

  return (
    <CollapseIconWrapper onClick={onClick}>
      <Icon name="collapse" />
    </CollapseIconWrapper>
  );
}

const CollapseIconWrapper = styled.div`
  color: ${Colors.blue6};
  cursor: pointer;
  padding-right: 8px;
`;
