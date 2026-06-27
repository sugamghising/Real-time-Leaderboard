/**
 * Input Component
 * Reusable input field with error state
 */

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
}: InputProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-on-surface">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full bg-surface text-on-surface placeholder:text-secondary/50 px-3 py-2 border rounded-none focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? "border-error" : "border-border"
        }`}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
};
