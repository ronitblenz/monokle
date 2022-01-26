import {useEffect, useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {existsSync} from 'fs';
import _ from 'lodash';
import path from 'path';

import {AnyTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {closeCreateProjectModal} from '@redux/reducers/ui';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFocus} from '@utils/hooks';

import Colors from '@styles/Colors';

import TemplateInformation from '../TemplateManagerPane/TemplateInformation';
import * as S from '../TemplateManagerPane/TemplateManagerPane.styled';
import TemplateModal from '../TemplateModal';

export enum FormSteps {
  STEP_ONE = 1,
  STEP_TWO = 2,
}

const CreateProjectModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.createProjectModal);
  const dispatch = useAppDispatch();
  const [createProjectForm] = useForm();
  const [inputRef, focus] = useFocus<any>();
  const [formStep, setFormStep] = useState(FormSteps.STEP_ONE);
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);
  const [formValues, setFormValues] = useState({name: '', rootFolder: projectsRootPath});
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate | undefined>(undefined);
  const [isModalHid, setIsModalHid] = useState(false);
  const [isSubmitEnabled, setSubmitEnabled] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditingRootPath, setIsEditingRoothPath] = useState(false);
  const [pickedPath, setPickedPath] = useState(projectsRootPath);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setPickedPath(folderPath);
        setFormValues({...formValues});
        setIsEditingRoothPath(false);
      }
    },
    {isDirectoryExplorer: true}
  );

  const setProjectRootPath = () => {
    let projectPath = formValues.rootFolder;
    if (!isEditingRootPath) {
      projectPath = formValues.name ? path.join(pickedPath, formValues.name) : pickedPath;
    }
    const pathExists = existsSync(projectPath);
    if (pathExists) {
      createProjectForm.setFields([
        {
          name: 'rootFolder',
          value: projectPath,
          errors: ['Path exists!'],
        },
      ]);
      setSubmitEnabled(false);
    } else {
      createProjectForm.setFields([{name: 'rootFolder', value: projectPath, errors: []}]);
      setSubmitEnabled(true);
    }
  };

  useEffect(() => {
    setProjectRootPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedPath, formValues, isEditingRootPath]);

  useEffect(() => {
    setFormValues({...formValues, rootFolder: projectsRootPath});
    setIsEditingRoothPath(false);
    setPickedPath(projectsRootPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRootPath, uiState.isOpen]);

  const onFinish = (values: {name: string; rootFolder: string}) => {
    setFormValues({...values});
    setIsEditingRoothPath(false);
    if (uiState.fromTemplate && formStep === FormSteps.STEP_ONE) {
      setFormStep(FormSteps.STEP_TWO);
    }
    if (!uiState.fromTemplate && values.rootFolder && values.name) {
      dispatch(setCreateProject({...values}));
      closeModal();
    }
  };

  useEffect(() => {
    if (formStep === FormSteps.STEP_ONE) {
      setSubmitEnabled(isFormValid);
    } else if (formStep === FormSteps.STEP_TWO) {
      setSubmitEnabled(isFormValid && Boolean(selectedTemplate));
    } else {
      setSubmitEnabled(false);
    }
  }, [isFormValid, selectedTemplate, formStep]);

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.isOpen]);

  const onClickOpenTemplate = (template: AnyTemplate) => {
    setSelectedTemplate(template);
  };

  const onTemplateModalClose = (status: string) => {
    if (status === 'PREVIEW') {
      setIsModalHid(true);
    }
    if (status === 'DONE') {
      closeModal();
    }

    if (status === 'CANCELED') {
      setSelectedTemplate(undefined);
    }
  };

  const closeModal = () => {
    setFormValues({name: '', rootFolder: ''});
    setIsEditingRoothPath(false);
    createProjectForm.resetFields();
    setFormStep(FormSteps.STEP_ONE);
    setSelectedTemplate(undefined);
    setIsModalHid(false);
    setSubmitEnabled(false);
    setIsFormValid(false);
    dispatch(closeCreateProjectModal());
  };

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title={
        uiState.fromTemplate ? (
          <div>
            <div style={{color: `${Colors.grey800}`, fontSize: '10px'}}>Step {formStep} of 2</div>
            <div>Create a Project from a Template</div>
          </div>
        ) : (
          <div>Create an Empty Project</div>
        )
      }
      visible={uiState?.isOpen}
      onCancel={closeModal}
      style={{opacity: isModalHid ? 0 : 1}}
      transitionName=""
      footer={[
        <Button key="cancel" onClick={closeModal}>
          Cancel
        </Button>,
        uiState.fromTemplate && formStep === FormSteps.STEP_TWO && (
          <Button key="back" onClick={() => setFormStep(FormSteps.STEP_ONE)}>
            Back
          </Button>
        ),
        <Button key="submit" type="primary" disabled={!isSubmitEnabled} onClick={() => createProjectForm.submit()}>
          {uiState.fromTemplate && formStep === FormSteps.STEP_ONE ? 'Next: Select a Template' : 'Create Project'}
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={createProjectForm}
        onFinish={onFinish}
        initialValues={() => formValues}
        style={{display: formStep === FormSteps.STEP_ONE ? 'block' : 'none'}}
        onFieldsChange={(field, allFields) => {
          const name = field.filter(item => _.includes(item.name.toString(), 'name'));
          if (name && name.length > 0) {
            setFormValues({...formValues, name: name[0].value});
            setIsEditingRoothPath(false);
          }
          const rootFolder = field.filter(item => _.includes(item.name.toString(), 'rootFolder'));
          if (rootFolder && rootFolder.length > 0) {
            setFormValues({...formValues, rootFolder: rootFolder[0].value});
            setIsEditingRoothPath(true);
          }
        }}
      >
        <Form.Item
          name="name"
          label="Project Name"
          required
          tooltip="The name of your project throughout Monokle. Default is the name of your selected folder."
          rules={[
            {
              required: true,
              message: 'Please provide your project name!',
            },
          ]}
        >
          <Input ref={inputRef} />
        </Form.Item>
        <Form.Item label="Location" required tooltip="The local path where your project will live.">
          <Input.Group compact>
            <Form.Item
              name="rootFolder"
              noStyle
              rules={[
                {
                  required: true,
                  message: 'Please provide your local path!',
                },
              ]}
            >
              <Input style={{width: 'calc(100% - 100px)'}} />
            </Form.Item>
            <Button style={{width: '100px'}} onClick={openFileExplorer}>
              Browse
            </Button>
          </Input.Group>
        </Form.Item>
      </Form>

      <S.TemplatesContainer $height={400} style={{display: formStep === FormSteps.STEP_TWO ? 'grid' : 'none'}}>
        {selectedTemplate && (
          <TemplateModal template={selectedTemplate} projectToCreate={formValues} onClose={onTemplateModalClose} />
        )}

        {Object.values(templateMap).map(template => (
          <TemplateInformation
            key={template.id}
            template={template}
            onClickOpenTemplate={() => onClickOpenTemplate(template)}
          />
        ))}
      </S.TemplatesContainer>
      <FileExplorer {...fileExplorerProps} />
    </Modal>
  );
};

export default CreateProjectModal;
