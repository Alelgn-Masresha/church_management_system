
import React, { useState } from 'react';
import { INITIAL_DATA, FormData } from '../types';
import { PersonalAndAddress } from './sections/PersonalAndAddress';
import { ReligiousAndMinistry } from './sections/ReligiousAndMinistry';
import { FamilyInfo } from './sections/FamilyInfo';
import { ProfessionalInfo } from './sections/ProfessionalInfo';
import { CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal & Address', subtitle: 'Basic Information' },
  { id: 2, title: 'Religious Info', subtitle: 'Background & Ministry' },
  { id: 3, title: 'Family', subtitle: 'Spouse & Children' },
  { id: 4, title: 'Professional', subtitle: 'Education & Work' },
  { id: 5, title: 'Review', subtitle: 'Confirm & Submit' },
];

interface Props {
  onSuccess?: (registeredUser: any) => void;
}

export const RegistrationWizard: React.FC<Props> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFormData = (fields: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateStep = (step: number): boolean => {


    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const fields = [
        { field: 'firstName', value: formData.firstName, label: 'First Name' },
        { field: 'middleName', value: formData.middleName, label: 'Middle Name' },
        { field: 'lastName', value: formData.lastName, label: 'Last Name' },
        { field: 'gender', value: formData.gender, label: 'Gender' },
        { field: 'birthDate', value: formData.birthDate, label: 'Birth Date' },
        { field: 'nationality', value: formData.nationality, label: 'Nationality' },
        { field: 'mobilePhone', value: formData.mobilePhone, label: 'Mobile Phone' },
        { field: 'subCity', value: formData.subCity, label: 'Sub City' },
        { field: 'city', value: formData.city, label: 'City' },
        { field: 'country', value: formData.country, label: 'Country' },
      ];

      for (const req of fields) {
        if (!req.value || (typeof req.value === 'string' && req.value.trim() === '') || (req.value === '+251 ')) {
          newErrors[req.field] = `${req.label} is required`;
        }
      }
    } else if (step === 2) {
      if (!formData.religiousBackground) newErrors.religiousBackground = 'Religious background is required';
      if (!formData.dateOfSalvation) newErrors.dateOfSalvation = 'Salvation date is required';
      if (!formData.isBaptized) newErrors.isBaptized = 'Baptism status is required';
      if (!formData.howDidYouCome || formData.howDidYouCome.trim() === '') newErrors.howDidYouCome = 'This field is required';
    } else if (step === 3) {
      if (!formData.maritalStatus) {
        newErrors.maritalStatus = 'Marital status is required';
      } else if (formData.maritalStatus === 'Married') {
        if (!formData.marriageDate) newErrors.marriageDate = 'Marriage date is required';
        if (!formData.spouseName) newErrors.spouseName = 'Spouse name is required';
        if (!formData.spouseMobile) newErrors.spouseMobile = 'Spouse mobile is required';
      }
    } else if (step === 4) {
      if (!formData.professionalStatus) {
        newErrors.professionalStatus = 'Professional status is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      const result = await response.json();
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      console.error(err);
      setGeneralError(err.message || 'An error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for registering with Summit Full Gospel Church.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData(INITIAL_DATA);
            setCurrentStep(1);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start New Registration
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[600px] flex flex-col">
      {/* Progress Steps */}
      <div className="mb-8 hidden md:block">
        <div className="flex justify-between">
          {steps.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex flex-col items-center group cursor-default">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors duration-300
                            ${isActive ? 'border-blue-600 text-blue-600' : isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400'}
                          `}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-bold">{step.id}</span>}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-gray-500'}`}>{step.title}</p>
                    <p className="text-xs text-gray-400 hidden lg:block">{step.subtitle}</p>
                  </div>
                </div>
                {idx !== steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 -z-0">
                    <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <span className="font-semibold text-gray-700">Step {currentStep} of {steps.length}</span>
        <span className="text-sm text-gray-500">{steps[currentStep - 1].title}</span>
      </div>

      {(Object.keys(errors).length > 0 || generalError) && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-shake">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">
            {generalError || "Please correct the highlighted errors before proceeding."}
          </span>
        </div>
      )}

      <div className="flex-grow">
        {currentStep === 1 && <PersonalAndAddress data={formData} update={updateFormData} errors={errors} />}
        {currentStep === 2 && <ReligiousAndMinistry data={formData} update={updateFormData} errors={errors} />}
        {currentStep === 3 && <FamilyInfo data={formData} update={updateFormData} errors={errors} />}
        {currentStep === 4 && <ProfessionalInfo data={formData} update={updateFormData} errors={errors} />}

        {currentStep === 5 && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Application</h2>
              <p className="text-gray-600">Please verify all information before submitting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2 border-b pb-1">Personal</h3>
                <p><span className="text-gray-500">Name:</span> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                <p><span className="text-gray-500">Phone:</span> {formData.mobilePhone}</p>
                <p><span className="text-gray-500">Address:</span> {formData.subCity}, {formData.city}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2 border-b pb-1">Ministry</h3>
                <p><span className="text-gray-500">Background:</span> {formData.religiousBackground}</p>
                <p><span className="text-gray-500">Selected Ministries:</span> {formData.ministries.join(', ') || 'None'}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2 border-b pb-1">Family</h3>
                <p><span className="text-gray-500">Status:</span> {formData.maritalStatus}</p>
                <p><span className="text-gray-500">Children:</span> {formData.children.length}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2 border-b pb-1">Professional</h3>
                <p><span className="text-gray-500">Status:</span> {formData.professionalStatus}</p>
                <p><span className="text-gray-500">Education Records:</span> {formData.educationHistory.length}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded text-sm mt-4">
              <input type="checkbox" className="mt-1" />
              <p>I confirm that the information provided above is true and correct to the best of my knowledge. I agree to abide by the church's principles and guidelines.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}

      {/* Navigation Buttons */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors
                  ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 border border-gray-300'}
                `}
        >
          <ChevronLeft size={20} /> Back
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors shadow-lg shadow-gray-200"
          >
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 
              ${isLoading ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
            {!isLoading && <CheckCircle2 size={20} />}
          </button>
        )}
      </div>
    </div >
  );
};
