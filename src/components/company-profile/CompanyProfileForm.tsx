/**
 * Company profile form component
 * Handles creating and updating company profiles
 */
import React, { useState, ReactElement } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, Divider, Text, ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components/native';
import { CompanyProfileCreatePayload, CompanyProfileUpdatePayload, CompanyProfile } from '../../services/company-profile';

const Container = styled.ScrollView`
  flex: 1;
`;

const FormSection = styled.View`
  margin-bottom: 24px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const InputContainer = styled.View`
  margin-bottom: 16px;
`;

const ButtonContainer = styled.View`
  margin-top: 24px;
  margin-bottom: 48px;
`;

// Define the VerificationProps interface
interface VerificationProps {
  verified: boolean;
}

// Create a properly typed styled component with the VerificationProps
const VerificationContainer = styled(View)<VerificationProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.verified ? '#E8F5E9' : '#FFF3E0'};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

// Create a properly typed styled component with the VerificationProps
const VerificationText = styled(Text)<VerificationProps>`
  flex: 1;
  margin-left: 8px;
  color: ${props => props.verified ? '#2E7D32' : '#E65100'};
`;

interface CompanyProfileFormProps {
  initialData?: CompanyProfile;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: CompanyProfileCreatePayload | CompanyProfileUpdatePayload) => Promise<void>;
  onVerifyGSTIN: (gstin: string) => Promise<{ valid: boolean; details?: any }>;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  initialData,
  isLoading,
  error,
  onSubmit,
  onVerifyGSTIN,
}) => {
  const [formData, setFormData] = useState<CompanyProfileCreatePayload | CompanyProfileUpdatePayload>(
    initialData || {
      name: '',
      gstin: '',
      location: '',
      industry: '',
      business_type: '',
      owner_name: '',
      coordinator_name: '',
      labour_policies: '',
      working_hours: '',
      employee_count: 0,
      leadership_details: '',
      email: '',
      phone: '',
      website: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gstinVerified, setGstinVerified] = useState(false);
  const [verifyingGstin, setVerifyingGstin] = useState(false);

  const updateField = (field: keyof (CompanyProfileCreatePayload | CompanyProfileUpdatePayload), value: string | number | object) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field if it exists
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = ['name', 'gstin', 'location', 'industry', 'email', 'phone'];
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
      }
    });

    // GSTIN validation (15-character alphanumeric)
    if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin as string)) {
      newErrors.gstin = 'GSTIN must be 15 characters (alphanumeric)';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email as string)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone as string)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Website validation
    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website as string)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    // Employee count validation
    if (formData.employee_count && (typeof formData.employee_count !== 'number' || formData.employee_count < 0)) {
      newErrors.employee_count = 'Employee count must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyGSTIN = async () => {
    if (!formData.gstin) {
      setErrors((prev) => ({
        ...prev,
        gstin: 'GSTIN is required for verification',
      }));
      return;
    }

    try {
      setVerifyingGstin(true);
      const result = await onVerifyGSTIN(formData.gstin as string);
      setGstinVerified(result.valid);
      
      if (result.valid && result.details) {
        // Auto-fill some fields based on GSTIN details if available
        const { name, address } = result.details;
        if (name && !formData.name) {
          updateField('name', name);
        }
        if (address && !formData.location) {
          updateField('location', address);
        }
      }
    } catch (err) {
      setGstinVerified(false);
    } finally {
      setVerifyingGstin(false);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <Container>
      <FormSection>
        <SectionTitle>Basic Information</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Company Name *"
            value={formData.name as string}
            onChangeText={(text) => updateField('name', text)}
            error={!!errors.name}
            disabled={isLoading}
          />
          {!!errors.name && <HelperText type="error">{errors.name}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="GSTIN *"
            value={formData.gstin as string}
            onChangeText={(text) => {
              updateField('gstin', text.toUpperCase());
              setGstinVerified(false);
            }}
            error={!!errors.gstin}
            disabled={isLoading}
            right={
              <TextInput.Affix
                text={verifyingGstin ? <ActivityIndicator size={16} /> as unknown as string : 'Verify'}
                textStyle={{ color: '#1976D2', fontWeight: 'bold' }}
                onPress={handleVerifyGSTIN}
              />
            }
          />
          {!!errors.gstin && <HelperText type="error">{errors.gstin}</HelperText>}
          
          {formData.gstin && (
            <VerificationContainer verified={gstinVerified}>
              <VerificationText verified={gstinVerified}>
                {gstinVerified
                  ? 'GSTIN verified successfully'
                  : 'GSTIN not verified. Please verify before submitting.'}
              </VerificationText>
            </VerificationContainer>
          )}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Location *"
            value={formData.location as string}
            onChangeText={(text) => updateField('location', text)}
            error={!!errors.location}
            disabled={isLoading}
          />
          {!!errors.location && <HelperText type="error">{errors.location}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Industry *"
            value={formData.industry as string}
            onChangeText={(text) => updateField('industry', text)}
            error={!!errors.industry}
            disabled={isLoading}
          />
          {!!errors.industry && <HelperText type="error">{errors.industry}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Business Type"
            value={formData.business_type as string}
            onChangeText={(text) => updateField('business_type', text)}
            error={!!errors.business_type}
            disabled={isLoading}
          />
          {!!errors.business_type && <HelperText type="error">{errors.business_type}</HelperText>}
        </InputContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Management Information</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Owner Name"
            value={formData.owner_name as string}
            onChangeText={(text) => updateField('owner_name', text)}
            error={!!errors.owner_name}
            disabled={isLoading}
          />
          {!!errors.owner_name && <HelperText type="error">{errors.owner_name}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Coordinator Name"
            value={formData.coordinator_name as string}
            onChangeText={(text) => updateField('coordinator_name', text)}
            error={!!errors.coordinator_name}
            disabled={isLoading}
          />
          {!!errors.coordinator_name && <HelperText type="error">{errors.coordinator_name}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Labour Policies"
            value={formData.labour_policies as string}
            onChangeText={(text) => updateField('labour_policies', text)}
            error={!!errors.labour_policies}
            disabled={isLoading}
            multiline
            numberOfLines={3}
          />
          {!!errors.labour_policies && <HelperText type="error">{errors.labour_policies}</HelperText>}
        </InputContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Operational Details</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Working Hours"
            value={formData.working_hours as string}
            onChangeText={(text) => updateField('working_hours', text)}
            error={!!errors.working_hours}
            disabled={isLoading}
          />
          {!!errors.working_hours && <HelperText type="error">{errors.working_hours}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Number of Employees"
            value={String(formData.employee_count || '')}
            onChangeText={(text) => updateField('employee_count', parseInt(text) || 0)}
            error={!!errors.employee_count}
            disabled={isLoading}
            keyboardType="number-pad"
          />
          {!!errors.employee_count && <HelperText type="error">{errors.employee_count}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Leadership Details"
            value={formData.leadership_details as string}
            onChangeText={(text) => updateField('leadership_details', text)}
            error={!!errors.leadership_details}
            disabled={isLoading}
            multiline
            numberOfLines={3}
          />
          {!!errors.leadership_details && <HelperText type="error">{errors.leadership_details}</HelperText>}
        </InputContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Contact Information</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Email *"
            value={formData.email as string}
            onChangeText={(text) => updateField('email', text)}
            error={!!errors.email}
            disabled={isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!!errors.email && <HelperText type="error">{errors.email}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Phone *"
            value={formData.phone as string}
            onChangeText={(text) => updateField('phone', text)}
            error={!!errors.phone}
            disabled={isLoading}
            keyboardType="phone-pad"
          />
          {!!errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Website"
            value={formData.website as string}
            onChangeText={(text) => updateField('website', text)}
            error={!!errors.website}
            disabled={isLoading}
            keyboardType="url"
            autoCapitalize="none"
          />
          {!!errors.website && <HelperText type="error">{errors.website}</HelperText>}
        </InputContainer>
      </FormSection>

      {error && (
        <HelperText type="error" style={{ marginBottom: 16 }}>
          {error}
        </HelperText>
      )}

      <ButtonContainer>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        >
          {initialData ? 'Update Profile' : 'Create Profile'}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default CompanyProfileForm;
