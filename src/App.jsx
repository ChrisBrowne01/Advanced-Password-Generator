import { useState } from 'react'
import './App.css'
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

// Custom Hook: usePasswordGenerator (Task 5)
  const PasswordGenerator = (initialLength = 10, initialNumAllowed = false, initialCharAllowed = false) => {
  const [length, setLength] = useState(initialLength);
  const [numberAllowed, setNumberAllowed] = useState(initialNumAllowed);
  const [characterAllowed, setcharacterAllowed] = useState(initialCharAllowed);
  const [password, setPassword] = useState("");

  const passwordRef = useRef(null)
    
  // Memoized function to generate the password (Task 2)
  const passwordGenerator = useCallback(() => {
      let pass = "";
      let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      if (numberAllowed) str += "0123456789";
      if (characterAllowed) str += "!@#$%^&*()_+-=[]{}|;:',.<>?/`~";
      for (let index = 0; index < length; index++) {
        let char = Math.floor(Math.random() * str.length + 1)
        pass += str.charAt(char)
      }
      setPassword(pass)
    }, [length, numberAllowed, characterAllowed, setPassword]);
  
    // useEffect hook to call generatePassword whenever its dependencies change (Task 1)
    // This ensures automatic password regeneration.
    const copyPasswordToClipboard = useCallback(() => {
      passwordRef.current?.select();
      passwordRef.current?.setSelectionRange(0, length);
      window.navigator.clipboard.writeText(password);
    }, [password])

    useEffect(() => {
      passwordGenerator();
    },[length, numberAllowed, characterAllowed, passwordGenerator]);
  return (
    <>
      <div className='w-full max-w-screen-md shadow-md rounded-lg px-4 py-4 my-8 bg-gray-800 text-yellow-500'>
        <h1>Password Generator App</h1>
        <div className='flex shadow rounded-lg overflow-hidden mb-4'>
          <input 
            type="text" 
            value={password} 
            className='outline-none w-full py-1 px-3' 
            placeholder='Password' 
            readOnly 
            ref={passwordRef} 
          />

          <button onClick={copyPasswordToClipboard} className='outline-none bg-slate-500 text-white px-4 px-1 shrink-0'>Copy</button>
        </div>
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
        </div>
      </div>
    </>
  )
}

export default PasswordGenerator
