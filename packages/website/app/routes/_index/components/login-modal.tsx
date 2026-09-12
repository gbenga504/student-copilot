import { MailCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/button/button";
import { Input } from "~/components/input/input";
import { Modal } from "~/components/modal/modal";

export type AuthActionData = {
  error?: string;
  codeSent?: boolean;
  requiresName?: boolean;
};

type LoginStep = "email" | "code" | "name";

type LoginModalProps = {
  open: boolean;
  requiresName: boolean;
  onClose: () => void;
};

export function LoginModal({ open, requiresName, onClose }: LoginModalProps) {
  const fetcher = useFetcher<AuthActionData>();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<LoginStep>(requiresName ? "name" : "email");
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(
    function showNextStep() {
      if (fetcher.data?.requiresName) {
        setStep("name");
        return;
      }

      if (fetcher.data?.codeSent) {
        setStep("code");
        setSecondsRemaining(60);
      }
    },
    [fetcher.data]
  );

  useEffect(
    function showRequiredNameStep() {
      if (open && requiresName) {
        setStep("name");
      }
    },
    [open, requiresName]
  );

  useEffect(
    function runResendTimer() {
      if (step !== "code" || secondsRemaining === 0) {
        return;
      }

      const timer = window.setTimeout(() => {
        setSecondsRemaining((currentSeconds) => currentSeconds - 1);
      }, 1000);

      return () => window.clearTimeout(timer);
    },
    [step, secondsRemaining]
  );

  const handleClose = () => {
    setCode("");
    setStep("email");
    onClose();
  };

  const renderEmailForm = () => {
    return (
      <fetcher.Form method="post" className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="intent" value="request-code" />
        <Input
          autoComplete="email"
          fullWidth
          label="Email address"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
          errorMessage={fetcher.data?.error}
        />
        <Button
          element="button"
          type="submit"
          fullWidth
          size="xLarge"
          className="justify-center"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText="Sending code"
        >
          Continue with email
        </Button>
      </fetcher.Form>
    );
  };

  const renderCodeForm = () => {
    return (
      <fetcher.Form method="post" className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="intent" value="verify-code" />
        <input type="hidden" name="email" value={email} />
        <Input
          autoComplete="one-time-code"
          fullWidth
          inputMode="numeric"
          label="Six-digit code"
          maxLength={6}
          name="code"
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          required
          value={code}
          errorMessage={fetcher.data?.error}
        />
        <div className="flex items-center justify-between gap-4">
          {secondsRemaining === 0 ? (
            <Button
              element="button"
              type="button"
              variant="text"
              disabled={isSubmitting}
              onClick={() => {
                fetcher.submit(
                  { intent: "request-code", email },
                  { method: "post" }
                );
              }}
            >
              Resend code
            </Button>
          ) : (
            <span className="text-xs text-gray-400">
              Resend in {secondsRemaining}s
            </span>
          )}
          <Button
            element="button"
            type="submit"
            size="large"
            className="justify-center"
            disabled={code.length !== 6 || isSubmitting}
            loading={isSubmitting}
            loadingText="Checking"
          >
            Verify
          </Button>
        </div>
      </fetcher.Form>
    );
  };

  const renderNameForm = () => {
    return (
      <fetcher.Form method="post" className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="intent" value="complete-profile" />
        <Input
          autoComplete="name"
          fullWidth
          label="Your name"
          maxLength={100}
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Ada Lovelace"
          required
          value={name}
          errorMessage={fetcher.data?.error}
        />
        <Button
          element="button"
          type="submit"
          fullWidth
          size="xLarge"
          className="justify-center"
          disabled={!name.trim() || isSubmitting}
          loading={isSubmitting}
          loadingText="Saving"
        >
          Continue to dashboard
        </Button>
      </fetcher.Form>
    );
  };

  const renderDescription = () => {
    if (step === "name") {
      return (
        <>
          <UserRound className="size-5 shrink-0 text-green-400" />
          <p>What should we call you in your workspace?</p>
        </>
      );
    }

    return (
      <>
        <MailCheck className="size-5 shrink-0 text-green-400" />
        <p>
          {step === "code"
            ? `We sent a login code to ${email}.`
            : "No password needed. We will email you a secure login code."}
        </p>
      </>
    );
  };

  const renderForm = () => {
    if (step === "name") {
      return renderNameForm();
    }

    return step === "code" ? renderCodeForm() : renderEmailForm();
  };

  return (
    <Modal
      open={open}
      onClose={step === "name" ? undefined : handleClose}
      showCloseButton={step === "email"}
      title={
        step === "name"
          ? "Welcome to Student Copilot"
          : step === "code"
            ? "Check your inbox"
            : "Log in or sign up"
      }
    >
      <div className="mt-2 flex items-center gap-3 text-sm leading-5 text-gray-400">
        {renderDescription()}
      </div>
      {renderForm()}
    </Modal>
  );
}
