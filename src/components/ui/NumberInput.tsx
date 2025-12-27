import React, { useState, useEffect } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, ...props }) => {
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    const parsedCurrent = parseFloat(displayValue);
    const effectiveCurrent = isNaN(parsedCurrent) ? 0 : parsedCurrent;
    
    // Only update local state if the external value is significantly different
    // from what our local state represents.
    if (effectiveCurrent !== value) {
      setDisplayValue(value.toString());
    }
  }, [value]); // Remove displayValue from deps to avoid loop/stale closure issues, though here we rely on value change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setDisplayValue(newVal);
    
    const parsed = parseFloat(newVal);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <input
      type="number"
      {...props}
      value={displayValue}
      onChange={handleChange}
    />
  );
};

