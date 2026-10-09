import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

/*
 * Published courses a student can take, newest first.
 * Each course includes lessons_count, topics_count and teacher_name.
 */
export function useStudentCourses() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/student/courses", { token });
      setCourses(data?.courses ?? []);
    } catch (requestError) {
      if (!requestError.status) {
        setError("Unable to connect to the server. Please try again.");
      } else if (requestError.status >= 500) {
        setError("Couldn't load the courses right now. Please try again.");
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
