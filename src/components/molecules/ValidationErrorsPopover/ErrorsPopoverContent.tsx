import {useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';

import ValidationErrorLink from '@molecules/ValidationErrorsPopover/ValidationErrorLink';

import {K8sResource, MonacoRange, ResourceValidationError} from '@monokle-desktop/shared/models';

import * as S from './ErrorsPopoverContent.styled';

interface IProps {
  resource: K8sResource;
}

const ErrorsPopoverContent: React.FC<IProps> = props => {
  const {resource} = props;

  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const errors = useMemo(() => {
    return [...(resource.validation?.errors ?? []), ...(resource.issues?.errors ?? [])];
  }, [resource]);

  const selectResource = (selectedId: string) => {
    if (resourceMap[selectedId]) {
      dispatch(selectK8sResource({resourceId: selectedId}));
    }
  };

  const makeMonacoSelection = (type: 'resource' | 'file', target: string, range: MonacoRange) => {
    const selection =
      type === 'resource'
        ? {
            type,
            resourceId: target,
            range,
          }
        : {type, filePath: target, range};
    dispatch(
      setMonacoEditor({
        selection,
      })
    );
  };

  const onLinkClick = (error: ResourceValidationError) => {
    if (selectedResourceId !== resource.id) {
      selectResource(resource.id);
    }

    if (error.errorPos) {
      const targetOutgoingRefRange: MonacoRange = {
        endColumn: error.errorPos.column + error.errorPos.length,
        endLineNumber: error.errorPos.line,
        startColumn: error.errorPos.column,
        startLineNumber: error.errorPos.line,
      };

      makeMonacoSelection('resource', resource.id, targetOutgoingRefRange);
    }
  };

  return (
    <S.Container>
      <S.PopoverTitle>Validation Errors</S.PopoverTitle>

      <S.Divider />

      {errors.map(error => (
        <S.RefDiv key={`${error.property}:${error.message}-${error.errorPos?.line}:${error.errorPos?.column}`}>
          <ValidationErrorLink validationError={error} onClick={() => onLinkClick(error)} />
          {error.description && <S.Description>{error.description}</S.Description>}
        </S.RefDiv>
      ))}
    </S.Container>
  );
};

export default ErrorsPopoverContent;
