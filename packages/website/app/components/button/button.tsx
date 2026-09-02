import classNames from "classnames";
import type React from "react";
import { Fragment, forwardRef, type ReactElement } from "react";
import type { NavLinkProps } from "react-router";
import { NavLink } from "react-router";

import { Spinner } from "~/components/spinner";
import { omit } from "~/libs/functional";

import "./button.scss";

interface CommonProps {
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large" | "xLarge";
  colorTheme?: "primary" | "gray";
  fullWidth?: boolean;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  disabled?: boolean;
  shape?: "circle";
}

export type ButtonProps = BaseButtonProps | AnchorProps | LinkProps;

interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {
  element: "button";
  loading?: boolean;
  loadingText?: string | null;
}

interface AnchorProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, CommonProps {
  element: "anchor";
}

interface LinkProps extends NavLinkProps, CommonProps {
  element: "link";
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    className,
    element,
    variant = "contained",
    size = "medium",
    colorTheme = "primary",
    fullWidth,
    startIcon,
    endIcon,
    disabled,
    shape,
  } = props;

  const buttonClassName = classNames(
    "button",
    {
      "button-contained": variant === "contained",
      "button-outlined": variant === "outlined",
      "button-text": variant === "text",
      "button-xLarge": size === "xLarge",
      "button-large": size === "large",
      "button-medium": size === "medium",
      "button-small": size === "small",
      "button-primary": colorTheme === "primary",
      "button-gray": colorTheme === "gray",
      "button-circle": shape === "circle",
      "button-fullWidth": fullWidth,
      "button-disabled": disabled,
    },
    className,
  );

  const commonKeys: (keyof CommonProps)[] = [
    "variant",
    "size",
    "colorTheme",
    "fullWidth",
    "startIcon",
    "endIcon",
    "shape",
  ];

  const getSpinnerColor = (): string => {
    return "currentColor";
  };

  const renderStartIcon = () => {
    if (startIcon) {
      return <span className="mr-1">{startIcon}</span>;
    }

    return null;
  };

  const renderEndIcon = () => {
    if (endIcon) {
      return <span className="ml-1">{endIcon}</span>;
    }

    return null;
  };

  const renderButton = (props: BaseButtonProps) => {
    const { loading, disabled, children } = props;

    let loadingText: null | undefined | string = props.loadingText;

    if (loadingText === null) {
      loadingText = null;
    } else if (loadingText === undefined) {
      loadingText = "Loading";
    }

    return (
      <button
        {...omit(props, [...commonKeys, "loading", "loadingText", "element"])}
        className={buttonClassName}
        disabled={loading || disabled}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {loading ? (
          <>
            <Spinner color={getSpinnerColor()} />
            <span className="ml-2">{loadingText}</span>
          </>
        ) : (
          <>
            {renderStartIcon()}
            {children}
            {renderEndIcon()}
          </>
        )}
      </button>
    );
  };

  const renderAnchor = (props: AnchorProps) => {
    return (
      <a
        {...omit(props, [...commonKeys, "element"])}
        className={buttonClassName}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        {renderStartIcon()}
        {props.children}
        {renderEndIcon()}
      </a>
    );
  };

  const renderLink = (props: LinkProps) => {
    const { children } = props;

    return (
      <NavLink
        {...omit(props, [...commonKeys, "element"])}
        className={buttonClassName}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        {(navLinkProps) => (
          <Fragment>
            {renderStartIcon()}
            {typeof children === "function" ? children(navLinkProps) : children}
            {renderEndIcon()}
          </Fragment>
        )}
      </NavLink>
    );
  };

  switch (element) {
    case "button":
      return renderButton(props);
    case "anchor":
      return renderAnchor(props);
    case "link":
      return renderLink(props);
  }
});
