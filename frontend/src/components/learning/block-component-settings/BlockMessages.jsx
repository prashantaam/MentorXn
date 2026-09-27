/*
 * =========================================================
 * MentorXn - Shared Learning Block Messages
 * =========================================================
 *
 * Global message renderer used by LearningBlockRenderer.
 *
 * Supported message types:
 *
 * - success
 * - warning
 * - danger
 *
 * =========================================================
 */


const MESSAGE_TYPES = [
  "success",
  "warning",
  "danger",
];


function BlockMessages({
  messages,
}) {
  /*
   * No messages configured.
   */

  if (
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    return null;
  }


  /*
   * Keep the original array index.
   *
   * This is important for the Visual Editor because
   * data-visual-index must point back to the correct
   * repeater item.
   */

  const visibleMessages =
    messages
      .map(
        (
          message,
          index
        ) => ({
          ...message,

          originalIndex:
            index,

          text:
            String(
              message?.text ??
                ""
            ).trim(),
        })
      )
      .filter(
        (message) =>
          message.text
      );


  if (
    visibleMessages.length ===
    0
  ) {
    return null;
  }


  return (
    <div className="learning-block-messages">
      {visibleMessages.map(
        (message) => {
          /*
           * Fall back to success if an invalid
           * message type somehow reaches the
           * frontend.
           */

          const type =
            MESSAGE_TYPES.includes(
              message?.type
            )
              ? message.type
              : "success";


          return (
            <div
              key={
                `learning-block-message-${message.originalIndex}`
              }
              className={
                `learning-block-message learning-block-message--${type}`
              }
              data-visual-index={
                message.originalIndex
              }
              role="note"
            >
              {message.text}
            </div>
          );
        }
      )}
    </div>
  );
}


export default BlockMessages;