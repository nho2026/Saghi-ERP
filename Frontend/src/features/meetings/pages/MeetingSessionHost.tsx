import { useState } from "react";
import { RequireAccess } from "@/features/auth/RequireAccess";
import MeetingsPage from "./MeetingsPage";

// Keep the session mounted outside the route outlet until the user logs out.
export function MeetingSessionHost({
  visible,
  onReturn,
}: {
  visible: boolean;
  onReturn: () => void;
}) {
  const [visited, setVisited] = useState(visible);
  if (visible && !visited) setVisited(true);
  if (!visited && !visible) return null;
  return (
    <RequireAccess>
      <MeetingsPage visible={visible} onReturn={onReturn} />
    </RequireAccess>
  );
}
