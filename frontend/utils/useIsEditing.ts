import { useIsLoggedIn } from "./useIsLoggedIn";
import { useIsMyPage } from "./useIsMyPage";

export function useIsEditing() {
  const isLoggedIn = useIsLoggedIn()
  const isMyPage = useIsMyPage()
  return isLoggedIn && isMyPage
}