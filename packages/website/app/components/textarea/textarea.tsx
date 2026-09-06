import classNames from "classnames";
import { forwardRef } from "react";
import "./textarea.scss";

type TextAreaProps = React.InputHTMLAttributes<HTMLTextAreaElement> & {
  errorMessage?: string;
  fullWidth?: boolean;
  label?: string;
  classes?: { container?: string; textarea?: string };
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      errorMessage,
      fullWidth,
      name,
      required = false,
      label,
      classes,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        className={classNames(
          "textarea textarea-container",
          {
            "w-full": fullWidth,
          },
          classes?.container,
        )}
      >
        {label && (
          <label htmlFor={rest.id} className="block font-medium text-sm mb-0.5">
            {label}
            {required && <span className="text-red-700 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={classes?.textarea}
          required={required}
          name={name}
          rows={1}
          {...rest}
        />

        {errorMessage && (
          <p className={`mt-1 text-sm text-red-700`}>{errorMessage}</p>
        )}
      </div>
    );
  },
);
