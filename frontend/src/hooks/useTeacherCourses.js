import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

/*
 * The signed-in teacher's courses, newest first.
 * Each course includes `lessons_count`.
 */
export function useTeacherCourses() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/teacher/courses", { token });
      setCourses(data?.courses ?? []);
    } catch (requestError) {
      // 4xx messages from Laravel are meaningful ("Teacher access required.");
      // 5xx ones ("Server Error") aren't, so replace them.
      if (!requestError.status) {
        setError("Unable to connect to the server. Please try again.");
      } else if (requestError.status >= 500) {
        setError("Couldn't load your courses right now. Please try again.");
      } else {
        setError(requestError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Fetching on mount is the point of this hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { courses, isLoading, error, reload: load };
}
