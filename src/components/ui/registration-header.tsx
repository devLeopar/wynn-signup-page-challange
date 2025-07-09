"use client";

import { useSignupStore } from "@/store/signup-store";

interface RegistrationHeaderProps {
  title?: string;
  description?: string;
  showStepIndicator?: boolean;
}

export const RegistrationHeader = ({ 
  title = "Registration",
  description = "Please enter below information to create your account.",
  showStepIndicator = true 
}: RegistrationHeaderProps) => {
  const { currentStep } = useSignupStore((state) => state.navigation);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-serif text-[#1A1A1A]">{title}</h1>
        {showStepIndicator && (
          <div className="text-2xl text-gray-600">Step {currentStep} of 3</div>
        )}
      </div>
      <p className="text-gray-600 text-lg">
        {description}
      </p>
    </div>
  );
}; 