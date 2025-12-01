import { useState } from 'react';
import Input from './Input.jsx';

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-8 text-xs text-gray-600 dark:text-gray-300 hover:underline"
        tabIndex={-1}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
