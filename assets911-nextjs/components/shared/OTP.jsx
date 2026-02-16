import React, { useRef, useState } from 'react';

function OtpInput({ numberOfDigits }) {
  const [otp, setOtp] = useState(new Array(numberOfDigits).fill(''));
  const [otpError, setOtpError] = useState(null);
  const otpBoxReference = useRef([]);

  function handleChange(value, index) {
    let newArr = [...otp];
    newArr[index] = value;
    setOtp(newArr);

    if (value && index < numberOfDigits - 1) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  function handleBackspaceAndEnter(e, index) {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpBoxReference.current[index - 1].focus();
    }
    if (e.key === 'Enter' && e.target.value && index < numberOfDigits - 1) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  return (
    <>
      <div className='flex items-center gap-4'>
        {otp.map((digit, index) => (
          <input
            key={index}
            value={digit}
            maxLength={1}
            onChange={e => handleChange(e.target.value, index)}
            onKeyUp={e => handleBackspaceAndEnter(e, index)}
            ref={reference => (otpBoxReference.current[index] = reference)}
            className={`border w-12 h-auto  p-3 rounded-md block  focus:border-2 focus:outline-none appearance-none`}
          />
        ))}
      </div>

      <p className={`text-lg  mt-4 ${otpError ? 'error-show' : ''}`}>
        {otpError}
      </p>
    </>
  );
}

export default OtpInput;
