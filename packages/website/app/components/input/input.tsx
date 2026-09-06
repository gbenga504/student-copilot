import classNames from "classnames";
import { forwardRef } from "react";
import "./input.scss";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  errorMessage?: string;
  helperText?: string;
  fullWidth?: boolean;
  label?: string;
  classes?: { container?: string; inputContainer?: string };
  startIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      errorMessage,
      helperText,
      fullWidth,
      name,
      required = false,
      label,
      classes,
      startIcon,
      disabled,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        className={classNames(
          "input relative",
          {
            "w-full": fullWidth,
          },
          classes?.container,
        )}
      >
        {label && (
          <label
            htmlFor={rest.id}
            className="block text-gray-800 font-medium text-sm mb-0.5"
          >
            {label}
            {required && <span className="text-red-700 ml-1">*</span>}
          </label>
        )}

        <div
          className={classNames("input-container", classes?.inputContainer, {
            "input-container-disabled": disabled,
          })}
        >
          {startIcon && <div className="mr-1">{startIcon}</div>}

          <input
            ref={ref}
            className={classNames(className, {
              "input-disabled": disabled,
            })}
            required={required}
            name={name}
            disabled={disabled}
            {...rest}
          />
        </div>

        {errorMessage && (
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
        )}

        {helperText && (
          <p className="mt-1 text-xs text-gray-600">{helperText}</p>
        )}
      </div>
    );
  },
);
