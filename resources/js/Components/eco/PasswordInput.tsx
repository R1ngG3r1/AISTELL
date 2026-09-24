import TextInput from '@/Components/TextInput';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { forwardRef, InputHTMLAttributes, useState } from 'react';

/** Input password dengan tombol lihat/sembunyikan. */
export default forwardRef<{ focus: () => void }, InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean }>(
    function PasswordInput({ className = '', ...props }, ref) {
        const [show, setShow] = useState(false);
        return (
            <div className="relative">
                <TextInput {...props} ref={ref} type={show ? 'text' : 'password'} className={`pe-11 ${className}`} />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute inset-y-0 end-0 grid w-11 place-items-center text-forest-900/35 transition hover:text-forest-900"
                    aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                    tabIndex={-1}
                >
                    <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
                </button>
            </div>
        );
    },
);
