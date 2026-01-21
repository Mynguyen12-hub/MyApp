import { router } from "expo-router";
import { Notifications } from "../components/Notifications";

export default function NotificationsRoute() {
  return (
    <Notifications
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/");
        }
      }}
    />
  );
}
