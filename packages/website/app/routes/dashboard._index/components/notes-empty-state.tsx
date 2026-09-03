import { Lock, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button";

export function NotesEmptyState() {
  const [isPrivacyNoticeVisible, setIsPrivacyNoticeVisible] = useState(true);

  const renderLockBadge = () => {
    return (
      <div className="flex size-9 items-center justify-center rounded-lg bg-app-gray-200">
        <Lock className="size-4 text-app-gray-100" />
      </div>
    );
  };

  const renderHeading = () => {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-serif text-4xl text-white">My notes</h1>
        <p className="text-app-gray-100">Notes that are just for you.</p>
      </div>
    );
  };

  const renderPrivateNotice = () => {
    return (
      <div className="flex items-center gap-1.5 text-xs text-app-gray-100">
        <Lock className="size-3" />
        Your private notes
      </div>
    );
  };

  const renderPrivacyBanner = () => {
    if (!isPrivacyNoticeVisible) {
      return null;
    }

    return (
      <div className="w-full rounded-xl border border-green-500/20 bg-green-500/10 p-6 text-left">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-white">
            Your private space
          </h2>
          <Button
            element="button"
            type="button"
            variant="text"
            colorTheme="gray"
            shape="circle"
            size="small"
            onClick={() => setIsPrivacyNoticeVisible(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-app-gray-100">
          Your notes live here by default. You can always view all your notes in
          this section
        </p>
      </div>
    );
  };

  const renderFirstNoteCta = () => {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-white">Take your first class note</p>
        <Button
          element="button"
          type="button"
          variant="contained"
          colorTheme="gray"
        >
          <Plus className="size-4" />
          New note
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        {renderLockBadge()}
        {renderHeading()}
        {renderPrivateNotice()}
        {renderPrivacyBanner()}
        <hr className="w-full border-app-gray-200" />
        {renderFirstNoteCta()}
      </div>
    </div>
  );
}
