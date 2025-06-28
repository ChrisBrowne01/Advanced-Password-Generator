import React, { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

// Custom Hook: usePasswordGenerator (Task 5)
const PasswordGenerator = ({initialLength = 10, initialNumAllowed = false, initialCharAllowed = false, initialExcludeSimilar = false, initialNumPasswords = 1, generatePassword}) => {
  const [length, setLength] = useState(initialLength);
  const [numberAllowed, setNumberAllowed] = useState(initialNumAllowed);
  const [characterAllowed, setcharacterAllowed] = useState(initialCharAllowed);
  const [excludeSimilar, setExcludeSimilar] = useState(initialExcludeSimilar);
  const [numPasswordsToGenerate, setNumPasswordsToGenerate] = useState(initialNumPasswords);
  const [passwords, setPasswords] = useState([]);

    
  // Memoized function to generate the password (Task 2)
  const passwordGenerator = useCallback(() => {
      let pass = "";
      let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let generatedPasswordsArray = [];

      
      if (numberAllowed) str += "0123456789";
      if (characterAllowed) str += "!@#$%^&*()_+-=[]{}|;:',.<>?/`~";

      // Bonus Challenge 1: Exclude similar characters
      if (excludeSimilar) {
        const similarChars = 'iIlL1oO0'; // Characters to exclude
        str = str.split('').filter(char => !similarChars.includes(char)).join('');
      }

      // Task 4: Error handling - prevent generating passwords with no character types selected
      if (!numberAllowed && !characterAllowed && str.length === 0) {
        setPasswords("Select at least one type!");
        return;
      }
      // If charSet becomes empty after filtering similar characters,
      // and no other types are allowed
      if (str.length === 0 && (!numberAllowed && !characterAllowed)) {
          setPasswords(["Cannot generate with current options!"]);
          return;
      }

      // Bonus Challenge 2: Generate multiple passwords
      for (let p = 0; p < numPasswordsToGenerate; p++) {
        let currentPass = "";
      for (let i = 0; i < length; i++) {
        let char = Math.floor(Math.random() * str.length)
        currentPass += str.charAt(char)
      }
        generatedPasswordsArray.push(currentPass);
      }
      setPasswords(generatedPasswordsArray);
    }, [length, numberAllowed, characterAllowed, excludeSimilar, numPasswordsToGenerate]);
    
    // useEffect hook to call generatePassword whenever its dependencies change (Task 3)
    // This ensures automatic password regeneration.
    useEffect(() => {
      passwordGenerator();
    },[length, numberAllowed, characterAllowed, excludeSimilar, numPasswordsToGenerate, passwordGenerator]);

    // Refs for password input fields (now an array of refs)
    const passwordRef = useRef([]);
    useEffect(() => {
      // Ensure passwordRefs.current has a ref for each password to be displayed
      passwordRef.current = passwords.map((_, i) => passwordRef.current[i] || React.createRef());
    }, [passwords]);

    // State for copy feedback for each individual password
    const [copiedStates, setCopiedStates] = useState(passwords.map(() => false));
    useEffect(() => {
        // Initialize or resize copiedStates array when passwords array changes
        setCopiedStates(Array(passwords.length).fill(false));
    }, [passwords.length]); 

    // Implement Copy Functionality with useRef (Task 3)
    const copyPasswordToClipboard = useCallback((index) => {
      const inputRef = passwordRef.current[index];
      if (inputRef && inputRef.current) {
        inputRef.current.select();
        document.execCommand('Copy');

        // Task 4: Visual feedback when password is copied
        setCopiedStates(prev => {
          const newStates = [...prev];
          newStates[index] = true;
          return newStates;
        });
        setTimeout(() => {
          setCopiedStates(prev => {
              const newStates = [...prev];
              newStates[index] = false;
              return newStates;
          });
        }, 1500); // Reset copied state after 1.5 seconds
        passwordRef.current[index]?.setSelectionRange(0, length);
        window.navigator.clipboard.writeText(passwords);
      }
    }, [passwords])

    
    // Bonus Challenge: Implement Keyboard Shortcuts
    useEffect(() => {
      const handleKeyDown = (event) => {
        // Alt/Ctrl + G to Generate New Password
        if ((event.altKey || event.ctrlKey) && event.key === 'g') {
          event.preventDefault(); 
          generatePassword(); 
        }
        // Alt/Ctrl + C to Copy First Password
        if ((event.altKey || event.ctrlKey) && event.key === 'c') {
          event.preventDefault();
          // Only attempt to copy if there's at least one password and it's not an error message
          if (passwords.length > 0 && 
              passwords[0] !== "Select character types!" && 
              passwords[0] !== "Cannot generate with current options!") {
              copyPasswordToClipboard(0); // Copy the first password in the array
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [generatePassword, copyPasswordToClipboard, passwords]);

  return (
    <>
      <div className='w-full max-w-screen-md shadow-md rounded-lg px-4 py-4 my-8 bg-gray-800 text-yellow-500'>
        <h1>Password Generator App</h1>
        {/* Bonus Challenge 2: Number of Passwords to Generate */}
        <div className="flex items-center gap-x-2 mb-4 justify-center">
            <label htmlFor="numPasswords" className="text-gray-300 text-base font-semibold">Generate:</label>
            <input
                type="number"
                id="numPasswords"
                min={1}
                max={10} // Arbitrary limit for reasonable UI
                value={numPasswordsToGenerate}
                onChange={(e) => setNumPasswordsToGenerate(Number(e.target.value) || 1)}
                className="w-20 py-1 px-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <label htmlFor='numPasswords' className="text-gray-300 text-base font-semibold">passwords</label>
        </div>
        {/* Display Generated Password(s) */}
        {passwords.map((password, index) => {
          return (
          <div key={index} className='flex flex-col mb-4 p-2 bg-gray-700 rounded-lg'>
            <div className='flex overflow-hidden'>
              <input 
                type="text" 
                value={password} 
                className='outline-none w-full py-1 px-3 text-lg bg-gray-600 text-yellow-300 read-only:cursor-default rounded-l-md' 
                placeholder='Generated Password' 
                readOnly 
                ref={passwordRef.current[index]} 
              />

              <button 
                onClick={() => copyPasswordToClipboard(index)} 
                className={`outline-none text-white px-4 py-2 shrink-0 transition-colors rounded-r-md 
                ${copiedStates[index] ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {copiedStates[index] ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          )
        })}
        <div className='flex text-sm gap-x-2'>
          <div className='flex items-center gap-x-1'>
            <input 
              type='range'
              min={6}
              max={100}
              value={length}
              className='cursor-pointer' 
              onChange={(e) => {setLength(e.target.value)}}
            />
            <label>Length:{length}</label>
          </div>
          <div className='flex items-center gap-x-1'>
            <input 
              type='checkbox'
              defaultChecked={numberAllowed}
              id="numbInput"
              onChange={() => {setNumberAllowed((previous) => !previous)}}
            />
            <label htmlFor='numbInput'>Numbers</label>
          </div>
          <div className='flex items-center gap-x-1'>
            <input 
              type='checkbox'
              defaultChecked={characterAllowed}
              id="charInput"
              onChange={() => {setcharacterAllowed((previous) => !previous)}}

            />
            <label htmlFor='charInput'>Characters</label>
          </div>
          <div className='flex items-center gap-x-1'>
            <input 
              type='checkbox'
              defaultChecked={excludeSimilar}
              id="excludeSimilarInput"
              onChange={() => {setExcludeSimilar((previous) => !previous)}}
              className='form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
            />
            <label htmlFor='excludeSimilarInput'>Exclude Similar (i,l,1,o,0)</label>
          </div>
        </div>
        <div className='flex text-sm gap-x-2'>
          {/* Keyboard Shortcut Hint */}
          <p className="text-gray-400 text-xs text-center mt-4">
              Shortcuts: <span className="font-semibold">Alt/Ctrl + G</span> to Generate, <span className="font-semibold">Alt/Ctrl + C</span> to Copy (first password).
          </p>
        </div>
      </div>
    </>
  )
}

export default PasswordGenerator
