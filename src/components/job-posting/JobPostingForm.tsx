/**
 * Job posting form component
 * Handles creating and updating job postings
 */
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, Divider, Text, Switch, Chip, Menu, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { JobPostingCreatePayload, JobPostingUpdatePayload, JobPosting } from '../../services/job-posting';

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

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const DatePickerContainer = styled.View`
  margin-bottom: 16px;
`;

const DatePickerButton = styled(Button)`
  margin-bottom: 8px;
`;

const DateText = styled.Text`
  margin-left: 8px;
`;

const EmploymentTypeContainer = styled.View`
  margin-bottom: 16px;
`;

const EmploymentTypeChip = styled(Chip)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

interface JobPostingFormProps {
  initialData?: JobPosting;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: JobPostingCreatePayload | JobPostingUpdatePayload) => Promise<void>;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  initialData,
  isLoading,
  error,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<JobPostingCreatePayload | JobPostingUpdatePayload>({
    title: initialData?.title || '',
    short_description: initialData?.short_description || '',
    long_description: initialData?.long_description || '',
    role: initialData?.role || '',
    domain: initialData?.domain || '',
    location: initialData?.location || '',
    salary_lower: initialData?.salary_lower || 0,
    salary_upper: initialData?.salary_upper || 0,
    employment_type: initialData?.employment_type || 'FULL_TIME',
    roles_responsibilities: initialData?.roles_responsibilities || '',
    requirements: initialData?.requirements || '',
    benefits: initialData?.benefits || '',
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shift_start_time: initialData?.shift_start_time || '09:00',
    shift_end_time: initialData?.shift_end_time || '17:00',
    timezone: initialData?.timezone || 'Asia/Kolkata',
    cancellation_terms: initialData?.cancellation_terms || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = [
      'title', 'short_description', 'role', 'domain', 'location',
      'salary_lower', 'salary_upper', 'employment_type', 'start_date', 'end_date'
    ];
    
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
      }
    });

    // Character limits
    if (formData.short_description && (formData.short_description as string).length > 255) {
      newErrors.short_description = 'Short description must be less than 255 characters';
    }

    if (formData.long_description && (formData.long_description as string).length > 5000) {
      newErrors.long_description = 'Long description must be less than 5000 characters';
    }

    // Salary validation
    if (
      formData.salary_lower &&
      formData.salary_upper &&
      Number(formData.salary_lower) > Number(formData.salary_upper)
    ) {
      newErrors.salary_lower = 'Lower salary cannot be greater than upper salary';
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date as string);
      const endDate = new Date(formData.end_date as string);
      if (startDate > endDate) {
        newErrors.start_date = 'Start date cannot be after end date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (field: 'start_date' | 'end_date', date: Date | undefined) => {
    if (date) {
      updateField(field, date.toISOString().split('T')[0]);
    }
    
    if (field === 'start_date') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  const handleTimeChange = (field: 'shift_start_time' | 'shift_end_time', event: any, date?: Date) => {
    if (date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      updateField(field, `${hours}:${minutes}`);
    }
    
    if (field === 'shift_start_time') {
      setShowStartTimePicker(false);
    } else {
      setShowEndTimePicker(false);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const employmentTypes = [
    { label: 'Full Time', value: 'FULL_TIME' },
    { label: 'Part Time', value: 'PART_TIME' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Gig', value: 'GIG' },
  ];

  return (
    <Container>
      <FormSection>
        <SectionTitle>Basic Information</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Job Title *"
            value={formData.title as string}
            onChangeText={(text) => updateField('title', text)}
            error={!!errors.title}
            disabled={isLoading}
          />
          {!!errors.title && <HelperText type="error">{errors.title}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Short Description *"
            value={formData.short_description as string}
            onChangeText={(text) => updateField('short_description', text)}
            error={!!errors.short_description}
            disabled={isLoading}
            multiline
            numberOfLines={2}
          />
          <HelperText type={errors.short_description ? "error" : "info"}>
            {errors.short_description || `${(formData.short_description as string).length}/255 characters`}
          </HelperText>
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Long Description"
            value={formData.long_description as string}
            onChangeText={(text) => updateField('long_description', text)}
            error={!!errors.long_description}
            disabled={isLoading}
            multiline
            numberOfLines={5}
          />
          <HelperText type={errors.long_description ? "error" : "info"}>
            {errors.long_description || `${(formData.long_description as string).length}/5000 characters`}
          </HelperText>
        </InputContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Job Details</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Role/Designation *"
            value={formData.role as string}
            onChangeText={(text) => updateField('role', text)}
            error={!!errors.role}
            disabled={isLoading}
          />
          {!!errors.role && <HelperText type="error">{errors.role}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Domain *"
            value={formData.domain as string}
            onChangeText={(text) => updateField('domain', text)}
            error={!!errors.domain}
            disabled={isLoading}
          />
          {!!errors.domain && <HelperText type="error">{errors.domain}</HelperText>}
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

        <Row>
          <InputContainer style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              label="Salary Lower *"
              value={String(formData.salary_lower || '')}
              onChangeText={(text) => updateField('salary_lower', parseInt(text) || 0)}
              error={!!errors.salary_lower}
              disabled={isLoading}
              keyboardType="number-pad"
            />
            {!!errors.salary_lower && <HelperText type="error">{errors.salary_lower}</HelperText>}
          </InputContainer>

          <InputContainer style={{ flex: 1, marginLeft: 8 }}>
            <TextInput
              label="Salary Upper *"
              value={String(formData.salary_upper || '')}
              onChangeText={(text) => updateField('salary_upper', parseInt(text) || 0)}
              error={!!errors.salary_upper}
              disabled={isLoading}
              keyboardType="number-pad"
            />
            {!!errors.salary_upper && <HelperText type="error">{errors.salary_upper}</HelperText>}
          </InputContainer>
        </Row>

        <EmploymentTypeContainer>
          <Text style={{ marginBottom: 8 }}>Employment Type *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {employmentTypes.map((type) => (
              <EmploymentTypeChip
                key={type.value}
                selected={formData.employment_type === type.value}
                onPress={() => updateField('employment_type', type.value)}
                disabled={isLoading}
              >
                {type.label}
              </EmploymentTypeChip>
            ))}
          </View>
          {!!errors.employment_type && <HelperText type="error">{errors.employment_type}</HelperText>}
        </EmploymentTypeContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Additional Details</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Roles & Responsibilities"
            value={formData.roles_responsibilities as string}
            onChangeText={(text) => updateField('roles_responsibilities', text)}
            error={!!errors.roles_responsibilities}
            disabled={isLoading}
            multiline
            numberOfLines={3}
          />
          {!!errors.roles_responsibilities && <HelperText type="error">{errors.roles_responsibilities}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Requirements"
            value={formData.requirements as string}
            onChangeText={(text) => updateField('requirements', text)}
            error={!!errors.requirements}
            disabled={isLoading}
            multiline
            numberOfLines={3}
          />
          {!!errors.requirements && <HelperText type="error">{errors.requirements}</HelperText>}
        </InputContainer>

        <InputContainer>
          <TextInput
            label="Benefits"
            value={formData.benefits as string}
            onChangeText={(text) => updateField('benefits', text)}
            error={!!errors.benefits}
            disabled={isLoading}
            multiline
            numberOfLines={3}
          />
          {!!errors.benefits && <HelperText type="error">{errors.benefits}</HelperText>}
        </InputContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Time-bound Information</SectionTitle>
        
        <DatePickerContainer>
          <Text style={{ marginBottom: 8 }}>Job Start Date *</Text>
          <DatePickerButton
            mode="outlined"
            onPress={() => setShowStartDatePicker(true)}
            disabled={isLoading}
          >
            {formData.start_date || 'Select Start Date'}
          </DatePickerButton>
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(formData.start_date as string)}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('start_date', date)}
            />
          )}
          {!!errors.start_date && <HelperText type="error">{errors.start_date}</HelperText>}
        </DatePickerContainer>

        <DatePickerContainer>
          <Text style={{ marginBottom: 8 }}>Job End Date *</Text>
          <DatePickerButton
            mode="outlined"
            onPress={() => setShowEndDatePicker(true)}
            disabled={isLoading}
          >
            {formData.end_date || 'Select End Date'}
          </DatePickerButton>
          {showEndDatePicker && (
            <DateTimePicker
              value={new Date(formData.end_date as string)}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('end_date', date)}
            />
          )}
          {!!errors.end_date && <HelperText type="error">{errors.end_date}</HelperText>}
        </DatePickerContainer>

        <Row>
          <DatePickerContainer style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ marginBottom: 8 }}>Shift Start Time</Text>
            <DatePickerButton
              mode="outlined"
              onPress={() => setShowStartTimePicker(true)}
              disabled={isLoading}
            >
              {formData.shift_start_time || 'Select Start Time'}
            </DatePickerButton>
            {showStartTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = (formData.shift_start_time as string).split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  return date;
                })()}
                mode="time"
                display="default"
                onChange={(event, date) => handleTimeChange('shift_start_time', event, date)}
              />
            )}
          </DatePickerContainer>

          <DatePickerContainer style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ marginBottom: 8 }}>Shift End Time</Text>
            <DatePickerButton
              mode="outlined"
              onPress={() => setShowEndTimePicker(true)}
              disabled={isLoading}
            >
              {formData.shift_end_time || 'Select End Time'}
            </DatePickerButton>
            {showEndTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = (formData.shift_end_time as string).split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  return date;
                })()}
                mode="time"
                display="default"
                onChange={(event, date) => handleTimeChange('shift_end_time', event, date)}
              />
            )}
          </DatePickerContainer>
        </Row>

        <InputContainer>
          <TextInput
            label="Timezone"
            value={formData.timezone as string}
            onChangeText={(text) => updateField('timezone', text)}
            error={!!errors.timezone}
            disabled={isLoading}
          />
          {!!errors.timezone && <HelperText type="error">{errors.timezone}</HelperText>}
        </InputContainer>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>Terms & Conditions</SectionTitle>
        
        <InputContainer>
          <TextInput
            label="Cancellation Terms"
            value={formData.cancellation_terms as string}
            onChangeText={(text) => updateField('cancellation_terms', text)}
            error={!!errors.cancellation_terms}
            disabled={isLoading}
            multiline
            numberOfLines={3}
          />
          {!!errors.cancellation_terms && <HelperText type="error">{errors.cancellation_terms}</HelperText>}
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
          {initialData ? 'Update Job Posting' : 'Create Job Posting'}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default JobPostingForm;
