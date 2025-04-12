import React, { useState } from 'react';
import styled from '@emotion/styled';

interface SaveLayoutDialogProps {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string, isDefault: boolean) => void;
  onCancel: () => void;
}

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 24rem;
`;

const DialogTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1e293b;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  
  ${props => props.primary
    ? `
      background-color: #3b82f6;
      color: white;
      
      &:hover {
        background-color: #2563eb;
      }
    `
    : `
      background-color: #f3f4f6;
      color: #4b5563;
      
      &:hover {
        background-color: #e5e7eb;
      }
    `
  }
`;

export const SaveLayoutDialog: React.FC<SaveLayoutDialogProps> = ({
  isOpen,
  initialName,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialName);
  const [isDefault, setIsDefault] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim(), isDefault);
  };

  return (
    <DialogOverlay>
      <DialogContent>
        <DialogTitle>Save Warehouse Layout</DialogTitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="layout-name">Layout Name</Label>
            <Input
              id="layout-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this layout"
              autoFocus
              required
            />
          </FormGroup>
          <CheckboxGroup>
            <Checkbox
              id="is-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <Label htmlFor="is-default" style={{ margin: 0 }}>
              Set as default layout
            </Label>
          </CheckboxGroup>
          <ButtonGroup>
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button primary type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </ButtonGroup>
        </form>
      </DialogContent>
    </DialogOverlay>
  );
}; 