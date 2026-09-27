import {
  createContext,
  useContext,
} from "react";

import BlockMessages from "./BlockMessages";


/*
 * =========================================================
 * MentorXn - Learning Block Shell
 * =========================================================
 *
 * Shared outer shell used by learning block components.
 *
 * Shared block-level UI can be supplied by
 * LearningBlockRenderer through context.
 *
 * This allows features such as Messages to appear inside
 * every learning block without modifying every individual
 * block component.
 *
 * =========================================================
 */


/*
 * =========================================================
 * Shared Block Context
 * =========================================================
 */

const LearningBlockSharedContext =
  createContext({
    messages: [],
  });


/*
 * =========================================================
 * Shared Block Provider
 * =========================================================
 *
 * Used by LearningBlockRenderer.
 *
 * Individual block components do not need to know about
 * this provider.
 *
 * =========================================================
 */

export function LearningBlockSharedProvider({
  messages = [],
  children,
}) {
  return (
    <LearningBlockSharedContext.Provider
      value={{
        messages:
          Array.isArray(messages)
            ? messages
            : [],
      }}
    >
      {children}
    </LearningBlockSharedContext.Provider>
  );
}


/*
 * =========================================================
 * Learning Block Shell
 * =========================================================
 */

function LearningBlockShell({
  title,
  icon,
  subtitle,
  children,
  className = "",
}) {
  const hasHeading =
    Boolean(
      title ||
      icon
    );


  /*
   * Shared block-level data supplied by
   * LearningBlockRenderer.
   */

  const {
    messages,
  } =
    useContext(
      LearningBlockSharedContext
    );


  return (
    <section
      className={
        `card learning-block ${className}`.trim()
      }
    >
      {hasHeading && (
        <h2>
          {icon && (
            <span aria-hidden="true">
              {icon}{" "}
            </span>
          )}

          {title}
        </h2>
      )}


      {subtitle && (
        <p className="sub">
          {subtitle}
        </p>
      )}


      {/*
       * -----------------------------------------
       * Individual Block Content
       * -----------------------------------------
       */}

      {children}


      {/*
       * -----------------------------------------
       * Shared Block Messages
       * -----------------------------------------
       *
       * Messages are rendered INSIDE the
       * learning-block section.
       *
       * Individual block components do not
       * need message-specific code.
       */}

      <BlockMessages
        messages={
          messages
        }
      />
    </section>
  );
}


export default LearningBlockShell;