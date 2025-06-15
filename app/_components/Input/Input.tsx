import React, { ChangeEvent, TextareaHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, Fragment } from 'react';
import styles from './Input.module.css';

// Define all possible input types
export type InputType =
    | 'text'
    | 'textarea'
    | 'join'
    | 'create'
    | 'login'
    | 'selectTherapy'
    | 'select'
    | 'search'
    | 'addnote'
    | 'transparentInput';

// Define chat context types
export type ChatContext = 'chat' | null;

// Base props that all input types share
interface BaseInputProps {
    id: string;
    label?: string;
    placeholder?: string;
    inputType: InputType;
    chat?: ChatContext;
    onHandleChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    disabled?: boolean;
    // required?: boolean;
}

// Props specific to different input types
interface TextInputProps extends BaseInputProps {
    inputType: 'text' | 'join';
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    value?: string;
}

interface TextareaInputProps extends BaseInputProps {
    inputType: 'textarea' | 'addnote';
    rows?: number;
    value?: string;
    maxLength?: number;
}

interface LoginInputProps extends BaseInputProps {
    inputType: 'login';
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    selectedQuesAnswers?: string;
    required?: boolean;
    value?: string;
    defaultValue?: string
}
interface CreateInputProps extends BaseInputProps {
    inputType: 'create';
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    selectedQuesAnswers?: string;
    required?: boolean;
    value?: string;
    icon?: React.ReactNode
}

interface SelectInputProps extends BaseInputProps {
    inputType: 'selectTherapy';
    options?: Array<{ value: string; label: string }>;
    value?: string;
}

interface SelectOptionProps extends BaseInputProps {
    inputType: 'select';
    option: string;
}

interface SearchInputProps extends BaseInputProps {
    inputType: 'search';
    onSearch?: (value: string) => void;
}

interface TransparentInputProps extends BaseInputProps {
    inputType: 'transparentInput';
    defaultValue?: string;
    handleSection?: (e: React.MouseEvent<HTMLInputElement>) => void;
}

// Union type for all possible input configurations
export type InputProps =
    | TextInputProps
    | TextareaInputProps
    | CreateInputProps
    | LoginInputProps
    | SelectInputProps
    | SelectOptionProps
    | SearchInputProps
    | TransparentInputProps;

const Input: React.FC<InputProps> = (props) => {
    const {
        id,
        label,
        placeholder,
        inputType,
        chat = null,
        onHandleChange,
        onChange,
        disabled = false,
    } = props;

    // Handle search input changes
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        if ('onSearch' in props && props.onSearch) {
            props.onSearch(e.target.value);
        }
        if (onChange) {
            onChange(e);
        }
    };

    // Render join input type
    if (inputType === 'join') {
        const joinProps = props as TextInputProps;
        return (
            <input
                id={id}
                type={joinProps.type || 'text'}
                name={id}
                disabled={disabled}
                placeholder={placeholder}
                className={styles.joinHeroInput}
                autoComplete="off"
                value={joinProps.value}
                onChange={onHandleChange || onChange}
            />
        );
    }


    // Render transparent input type
    if (inputType === 'transparentInput') {
        const transparentProps = props as TransparentInputProps;
        return (
            <input
                readOnly
                onClick={transparentProps.handleSection}
                type="text"
                className={styles.transparentInput}
                value={transparentProps.defaultValue}
            />
        );
    }

    // Container for most input types
    const containerClass = chat === 'chat' ? styles.inputLabel : styles.inputLabel1;

    return (
        <>
            <div className={containerClass}>
                {/* Text Input */}
                {inputType === 'text' && (
                    <Fragment>
                        <label htmlFor={id} className={styles.label}>
                            {label}
                        </label>
                        <input
                            id={id}
                            type={(props as TextInputProps).type || 'text'}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={styles.styledInput}
                            name={id}
                            autoComplete="off"
                            value={(props as TextInputProps).value}
                            onChange={onHandleChange || onChange}
                        />
                    </Fragment>
                )}

                {/* Select for Therapy */}
                {inputType === 'selectTherapy' && (
                    <Fragment>
                        <label htmlFor={id} className={styles.label}>
                            {label}
                        </label>
                        <select
                            className={styles.styledInput}
                            style={{ backgroundColor: 'white' }}
                            name={id}
                            id={id}
                            disabled={disabled}
                            value={(props as SelectInputProps).value}
                            onChange={onHandleChange || onChange}
                        >
                            {(props as SelectInputProps).options ? (
                                (props as SelectInputProps).options!.map((option, index) => (
                                    <option key={index} value={option.value}>
                                        {option.label}
                                    </option>
                                ))
                            ) : (
                                <Fragment>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </Fragment>
                            )}
                        </select>
                    </Fragment>
                )}

                {/* Textarea */}
                {inputType === 'textarea' && (
                    <Fragment>
                        <label htmlFor={id} className={styles.label}>
                            {label}
                        </label>
                        <textarea
                            id={id}
                            name={id}
                            disabled={disabled}
                            rows={(props as TextareaInputProps).rows || (chat ? 2 : 6)}
                            placeholder={placeholder}
                            className={`${styles.styledInputArea} ${chat === 'chat' ? styles.chatTextarea : ''
                                }`}
                            autoComplete="off"
                            value={(props as TextareaInputProps).value}
                            maxLength={(props as TextareaInputProps).maxLength}
                            onChange={onHandleChange || onChange}
                        />
                    </Fragment>
                )}
            </div>

            {/* Login Input with Floating Label */}
            {inputType === 'login' && (
                <div className={styles.inputContainer}>
                    <input
                        id={id}
                        type={(props as LoginInputProps).type || 'text'}
                        name={id}
                        placeholder=" "
                        className={styles.loginInput}
                        required={(props as LoginInputProps).required}
                        // value={(props as CreateInputProps).value}
                        // value={(props as CreateInputProps).selectedQuesAnswers}
                        defaultValue={(props as LoginInputProps).defaultValue}
                        onChange={onHandleChange || onChange}
                        autoComplete="off"
                        // readOnly
                        disabled={disabled}
                    />
                    <label htmlFor={id} className={styles.loginInpLabel}>
                        {label}
                    </label>
                </div>
            )}

            {/* Create Input with Floating Label */}
            {inputType === 'create' && (
                <div className={styles.createGroup}>
                    <label htmlFor={id} className={styles.createLabel}>{label}</label>
                    <div className={styles.createContainer}>
                        {(props as CreateInputProps).icon}
                        <input
                            id={id}
                            type={(props as CreateInputProps).type || 'text'}
                            required
                            className={styles.createInput}
                            placeholder={placeholder}
                        />
                    </div>
                </div>
            )}

            {/* Select Option (Single Option) */}
            {inputType === 'select' && (
                <option value={(props as SelectOptionProps).option}>
                    {(props as SelectOptionProps).option}
                </option>
            )}

            {/* Search Input */}
            {inputType === 'search' && (
                <div className={styles.searchContainer}>
                    <span className={styles.searchIcon}>
                        🔍
                    </span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={placeholder || 'Search...'}
                        disabled={disabled}
                        onChange={handleSearchChange}
                    />
                </div>
            )}

            {/* Add Note Textarea */}
            {inputType === 'addnote' && (
                <textarea
                    placeholder={placeholder}
                    className={styles.noteTextarea}
                    name={id}
                    id={id}
                    disabled={disabled}
                    value={(props as TextareaInputProps).value}
                    maxLength={(props as TextareaInputProps).maxLength}
                    onChange={onHandleChange}
                />
            )}
        </>
    );
};

export default Input;

// Example usage with TypeScript:
/*
// Text input
<Input
  id="email"
  inputType="text"
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Textarea with chat context
<Input
  id="message"
  inputType="textarea"
  label="Message"
  placeholder="Type your message..."
  chat="chat"
  rows={3}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

// Create input with floating label
<Input
  id="username"
  inputType="create"
  label="Username"
  selectedQuesAnswers={username}
  onChange={(e) => setUsername(e.target.value)}
  required
/>

// Select with custom options
<Input
  id="gender"
  inputType="selectTherapy"
  label="Gender"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]}
  value={gender}
  onChange={(e) => setGender(e.target.value)}
/>

// Search input
<Input
  id="search"
  inputType="search"
  placeholder="Search users..."
  onSearch={(value) => handleSearch(value)}
/>

// Join input (for hero sections)
<Input
  id="join-email"
  inputType="join"
  type="email"
  placeholder="Enter email to join"
  onChange={(e) => setJoinEmail(e.target.value)}
/>

// Add note textarea
<Input
  id="note"
  inputType="addnote"
  placeholder="Add your note here..."
  onHandleChange={(e) => setNote(e.target.value)}
/>
*/