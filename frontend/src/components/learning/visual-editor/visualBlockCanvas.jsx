import {
  useEffect,
  useRef,
} from "react";

import LearningBlockRenderer from "../block-component-settings/LearningBlockRenderer";

import {
  findVisualSelection,
  getVisualFields,
} from "./visualEditorUtils";


function VisualBlockCanvas({
  block,
  schema,
  selection,
  onSelect,
}) {
  const rootRef =
    useRef(null);

  const visualFields =
    getVisualFields(
      schema
    );

  const hasVisualEditing =
    visualFields.length > 0;


  /*
   * =========================================
   * Mark Editable DOM Regions
   * =========================================
   *
   * Selectors come from the template schema.
   *
   * We add only generic editor attributes.
   * No block-specific CSS is required here.
   * =========================================
   */

  useEffect(() => {
    const root =
      rootRef.current;

    if (!root) {
      return undefined;
    }

    const editableElements =
      [];

    visualFields.forEach(
      (field) => {
        const selector =
          field.visual
            ?.selector;

        if (!selector) {
          return;
        }

        root
          .querySelectorAll(
            selector
          )
          .forEach(
            (element) => {
              element.setAttribute(
                "data-visual-editor-editable",
                "true"
              );

              editableElements.push(
                element
              );
            }
          );
      }
    );

    return () => {
      editableElements.forEach(
        (element) => {
          element.removeAttribute(
            "data-visual-editor-editable"
          );

          element.removeAttribute(
            "data-visual-editor-hover"
          );
        }
      );
    };
  }, [
    visualFields,
    block,
  ]);


  /*
   * =========================================
   * Hover
   * =========================================
   */

  const handleMouseOver = (
    event
  ) => {
    const target =
      event.target;

    if (
      !(target instanceof Element)
    ) {
      return;
    }

    const editable =
      target.closest(
        "[data-visual-editor-editable]"
      );

    if (
      !editable ||
      !rootRef.current?.contains(
        editable
      )
    ) {
      return;
    }

    editable.setAttribute(
      "data-visual-editor-hover",
      "true"
    );
  };


  const handleMouseOut = (
    event
  ) => {
    const target =
      event.target;

    if (
      !(target instanceof Element)
    ) {
      return;
    }

    const editable =
      target.closest(
        "[data-visual-editor-editable]"
      );

    editable?.removeAttribute(
      "data-visual-editor-hover"
    );
  };


  /*
   * =========================================
   * Click Selection
   * =========================================
   */

  const handleClickCapture = (
    event
  ) => {
    if (
      !hasVisualEditing
    ) {
      return;
    }

    const nextSelection =
      findVisualSelection({
        target:
          event.target,
        root:
          rootRef.current,
        schema,
      });

    if (nextSelection) {
      onSelect?.(
        nextSelection
      );
    }
  };


  /*
   * =========================================
   * Render
   * =========================================
   */

  return (
    <div
      ref={rootRef}
      className={
        hasVisualEditing
          ? "visual-block-canvas visual-block-canvas--editable"
          : "visual-block-canvas"
      }
      onMouseOver={
        handleMouseOver
      }
      onMouseOut={
        handleMouseOut
      }
      onClickCapture={
        handleClickCapture
      }
    >
      <LearningBlockRenderer
        block={block}
      />
    </div>
  );
}

export default VisualBlockCanvas;