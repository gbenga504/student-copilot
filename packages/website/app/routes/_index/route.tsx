import { ArrowRight, BookOpenText, Sparkles } from "lucide-react";
import { useState } from "react";
import { data, redirect } from "react-router";

import { Button } from "~/components/button/button";
import { authTokenCookie, getOptionalUser } from "~/libs/auth.server";
import {
  actionWithServerContext,
  loaderWithServerContext,
  type ServerRouteContext,
} from "~/libs/route-api.server";
import { LoginModal } from "~/routes/_index/components/login-modal";

import type { Route } from "./+types/route";
import "./route.scss";

export function meta() {
  return [
    { title: "Student Copilot" },
    {
      name: "description",
      content: "Turn class notes into a workspace you can think with.",
    },
  ];
}

export const loader = loaderWithServerContext(
  async ({ api, request }: Route.LoaderArgs & ServerRouteContext) => {
    return { user: await getOptionalUser({ api, request }) };
  }
);

export const action = actionWithServerContext(
  async ({ api, request }: Route.ActionArgs & ServerRouteContext) => {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const email = String(formData.get("email") ?? "");

    if (intent === "request-code") {
      await api.auth.requestLoginCode(email);
      return data({ codeSent: true });
    }

    if (intent === "verify-code") {
      const result = await api.auth.verifyLoginCode(
        email,
        String(formData.get("code") ?? "")
      );
      const headers = {
        "Set-Cookie": await authTokenCookie.serialize(result.accessToken),
      };

      if (result.requiresName) {
        return data({ requiresName: true }, { headers });
      }

      return redirect("/dashboard", {
        headers,
      });
    }

    if (intent === "complete-profile") {
      await api.auth.updateCurrentUser(String(formData.get("name") ?? ""));
      return redirect("/dashboard");
    }

    return data({ error: "Unsupported action" }, { status: 400 });
  }
);

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [isLoginOpen, setIsLoginOpen] = useState(Boolean(user?.requiresName));

  const renderAction = () => {
    if (user && !user.requiresName) {
      return (
        <Button
          element="link"
          to="/dashboard"
          size="xLarge"
          endIcon={<ArrowRight className="size-4" />}
          className="justify-center px-5"
        >
          Continue to dashboard
        </Button>
      );
    }

    return (
      <Button
        element="button"
        type="button"
        size="xLarge"
        endIcon={<ArrowRight className="size-4" />}
        className="justify-center px-5"
        onClick={() => setIsLoginOpen(true)}
      >
        {user?.requiresName ? "Complete your profile" : "Log in with email"}
      </Button>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-app-gray-400">
      <div className="home-grid absolute inset-0" />
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <BookOpenText className="size-5 text-green-400" />
          Student Copilot
        </div>
        <span className="text-xs uppercase text-gray-400">Your study desk</span>
      </nav>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-6xl items-center px-6 pb-16 sm:px-10">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-green-300">
            <Sparkles className="size-4" />
            Notes, focused
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] text-white sm:text-7xl">
            {user
              ? `Welcome back, ${user.name}`
              : "Hello, ready to pick up where you left off?"}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            {user
              ? "Your notes and study tools are waiting in the dashboard."
              : "Use your email to open your workspace. We will send a one-time code, so there is no password to remember."}
          </p>
          <div className="mt-9">{renderAction()}</div>
        </div>
      </section>

      <LoginModal
        open={isLoginOpen}
        requiresName={Boolean(user?.requiresName)}
        onClose={() => setIsLoginOpen(false)}
      />
    </main>
  );
}
