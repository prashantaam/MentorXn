import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest, fieldErrors } from "../../api/client";
import BuilderModal from "../../components/course-builder/BuilderModal";
import ConfirmDialog from "../../components/course-builder/ConfirmDialog";
import FormField from "../../components/forms/FormField";
import { useAuth } from "../../context/AuthContext";
import { ACCENT_COLORS } from "../../data/courseOptions";
import { categoryLabel } from "../../lib/blockCategories";

import "../../styles/pages/create-course.css"; // swatches, status options
import "../../styles/pages/block-templates.css";

const EMPTY_FORM = { name: "", icon: "", color: ACCENT_COLORS[0].value, position: "", status: "active" };

/*
 * Developer page: the categories the block library is grouped by.
 * Add, rename, recolour, reorder, deactivate; categories with templates
 * can't be deleted.
 */
function BlockCategoryListPage() {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [flash, setFlash] = useState(null);

  // Add/edit dialog: null = closed, { id?: number } = open.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await apiRequest("/api/dev/block-categories", { token });
      setCategories(data?.block_categories ?? []);
    } catch (error) {
      setLoadError(error.status ? error.message : "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Fetching on mount is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError("");
    setEditing({});
  };

  const openEdit = (category) => {
    setForm({
      name: category.name,
      icon: category.icon || "",
      color: category.color,
      position: String(category.position ?? ""),
      status: category.status,
    });
    setErrors({});
    setFormError("");
    setEditing({ id: category.id });
  };

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
    setFormError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Give the category a name." });
      return;
    }

    setIsSaving(true);
    const body = {
      name: form.name.trim(),
      icon: form.icon.trim() || null,
      color: form.color,
      status: form.status,
      position: form.position === "" ? null : Number(form.position),
    };

    try {
      await apiRequest(editing.id ? `/api/dev/block-categories/${editing.id}` : "/api/dev/block-categories", {
        token,
        method: editing.id ? "PUT" : "POST",
        body,
      });
      setEditing(null);
      setFlash({ tone: "good", text: `"${body.name}" ${editing.id ? "saved" : "created"}.` });
      load();
    } catch (error) {
      if (error.data?.errors) setErrors(fieldErrors(error.data.errors));
      else setFormError(error.status ? error.message : "Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    setDeleteError("");
    try {
      await apiRequest(`/api/dev/block-categories/${deleting.id}`, { token, method: "DELETE" });
      setFlash({ tone: "good", text: `"${deleting.name}" deleted.` });
      setDeleting(null);
      load();
    } catch (error) {
      setDeleteError(error.status ? error.message : "Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const isCustomColour = !ACCENT_COLORS.some((colour) => colour.value === form.color);

  return (
    <div className="mx-page mx-templates">
      <Link className="mx-back-link" to="/dev/block-templates">
        ← Back to block templates
      </Link>

      <header className="mx-templates__head">
        <div>
          <h1>Block categories</h1>
          <p className="mx-hint">
            The groups teachers see in the block library, in this order. A category
            with templates can't be deleted — move its templates or set it to inactive.
          </p>
        </div>
        <button type="button" className="mx-btn" onClick={openNew}>
          ➕ New category
        </button>
      </header>

      {flash && (
        <div className={`mx-feedback mx-feedback--${flash.tone} mx-templates__flash`} role="status">
          <span>{flash.text}</span>
          <button type="button" className="mx-templates__flash-close" onClick={() => setFlash(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      {isLoading && <p className="mx-hint">Loading categories…</p>}

      {!isLoading && loadError && (
        <div className="mx-feedback mx-feedback--bad" role="alert">
          {loadError}{" "}
          <button type="button" className="mx-btn mx-btn--ghost mx-btn--sm" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !loadError && (
        <ul className="mx-templates__list mx-categories">
          {categories.map((category) => {
            const used = category.block_templates_count ?? 0;

            return (
              <li key={category.id} className="mx-template-row mx-category-row" style={{ "--mx-wc": category.color }}>
                <span className="mx-world__label mx-category-row__chip">{categoryLabel(category)}</span>

                <span className="mx-grow mx-template-row__meta">
                  <code>{category.slug}</code>
                  <span>position {category.position}</span>
                </span>

                <span className="mx-template-row__usage">
                  {used}
                  <small> template{used === 1 ? "" : "s"}</small>
                </span>

                <span className={`mx-tag ${category.status === "active" ? "mx-status-tag--published" : "mx-status-tag--draft"}`}>
                  {category.status === "active" ? "Active" : "Inactive"}
                </span>

                <span className="mx-category-row__actions">
                  <button type="button" className="mx-btn mx-btn--ghost mx-btn--sm" onClick={() => openEdit(category)}>
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="mx-btn mx-btn--danger mx-btn--sm"
                    disabled={used > 0}
                    title={used > 0 ? "Has templates — move them first, or set the category to inactive." : "Delete category"}
                    aria-label={`Delete ${category.name}`}
                    onClick={() => {
                      setDeleteError("");
                      setDeleting(category);
                    }}
                  >
                    🗑️
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* ---------- add / edit ---------- */}
      {editing && (
        <BuilderModal
          kicker="Block library"
          title={editing.id ? "✏️ Edit category" : "➕ New category"}
          onClose={() => setEditing(null)}
          busy={isSaving}
        >
          <form onSubmit={handleSave} noValidate>
            {formError && (
              <div className="mx-feedback mx-feedback--bad" role="alert">
                {formError}
              </div>
            )}

            <div className="mx-category-preview" style={{ "--mx-wc": form.color }}>
              <span className="mx-world__label">{categoryLabel({ name: form.name.trim() || "Category name", icon: form.icon.trim() })}</span>
            </div>

            <FormField id="cat-name" label="Name" error={errors.name}>
              <input type="text" maxLength={60} value={form.name} onChange={(event) => setField("name", event.target.value)} autoFocus />
            </FormField>

            <div className="mx-inline-fields">
              <FormField id="cat-icon" label="Icon" error={errors.icon} hint="Any emoji.">
                <input type="text" className="mx-icon-input" maxLength={8} value={form.icon} onChange={(event) => setField("icon", event.target.value)} />
              </FormField>

              <FormField id="cat-position" label="Position" error={errors.position} hint={editing.id ? "Lower comes first." : "Blank = add at the end."}>
                <input type="number" min={0} max={9999} value={form.position} onChange={(event) => setField("position", event.target.value)} />
              </FormField>
            </div>

            <div className="mx-field">
              <span className="mx-field__label" id="cat-colour">
                Colour
              </span>
              <div className="mx-swatches" role="group" aria-labelledby="cat-colour">
                {ACCENT_COLORS.map((colour) => (
                  <button
                    key={colour.value}
                    type="button"
                    className={`mx-swatch${form.color === colour.value ? " is-on" : ""}`}
                    style={{ background: colour.value }}
                    title={colour.name}
                    aria-label={colour.name}
                    aria-pressed={form.color === colour.value}
                    onClick={() => setField("color", colour.value)}
                  />
                ))}
                <label
                  className={`mx-swatch mx-swatch--custom${isCustomColour ? " is-on" : ""}`}
                  style={isCustomColour ? { background: form.color } : undefined}
                  title="Custom colour"
                >
                  <span aria-hidden="true">{isCustomColour ? "" : "＋"}</span>
                  <input
                    type="color"
                    className="mx-visually-hidden"
                    aria-label="Pick a custom colour"
                    value={form.color}
                    onChange={(event) => setField("color", event.target.value)}
                  />
                </label>
              </div>
              {errors.color && <div className="mx-field__error">{errors.color}</div>}
            </div>

            <div className="mx-status-options" role="radiogroup" aria-label="Status">
              {[
                { value: "active", label: "✅ Active", hint: "Shown in the block library." },
                { value: "inactive", label: "⏸️ Inactive", hint: "Hidden from teachers." },
              ].map((option) => (
                <label key={option.value} className={`mx-status-option${form.status === option.value ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="status"
                    className="mx-visually-hidden"
                    value={option.value}
                    checked={form.status === option.value}
                    onChange={() => setField("status", option.value)}
                  />
                  <b>{option.label}</b>
                  <span className="mx-hint">{option.hint}</span>
                </label>
              ))}
            </div>

            <div className="mx-modal__actions">
              <button type="button" className="mx-btn mx-btn--ghost" disabled={isSaving} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="mx-btn" disabled={isSaving}>
                {isSaving ? "Saving…" : editing.id ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </BuilderModal>
      )}

      {deleting && (
        <ConfirmDialog
          kicker="Block library"
          title="🗑️ Delete category"
          subject={categoryLabel(deleting)}
          warning="It can't be undone."
          error={deleteError}
          confirmLabel="Delete category"
          busy={isSaving}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

export default BlockCategoryListPage;
