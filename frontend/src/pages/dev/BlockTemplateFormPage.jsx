import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiRequest, fieldErrors } from "../../api/client";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import FormField from "../../components/forms/FormField";
import LearningBlockRenderer from "../../components/learning/block-component-settings/LearningBlockRenderer";
import blockRegistry from "../../components/learning/block-component-settings/blockRegistry";
import { useAuth } from "../../context/AuthContext";
import { UNCATEGORISED, categoryLabel } from "../../lib/blockCategories";

import "../../styles/pages/create-course.css"; // shared form layout (two columns, form card)
import "../../styles/pages/block-templates.css";

const LIST_PATH = "/dev/block-templates";

const REGISTERED_COMPONENTS = Object.keys(blockRegistry).sort();

const STARTER_SCHEMA = {
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "icon", label: "Icon", type: "text" },
  ],
};

const STARTER_EXAMPLE = { title: "My new block", icon: "🧱" };

const pretty = (value) => JSON.stringify(value ?? {}, null, 2);

/* Parse a JSON textarea; returns { value, error }. */
function parseJson(text, { requireFields = false } = {}) {
  try {
    const value = JSON.parse(text);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return { error: "Must be a JSON object: { … }" };
    }
    if (requireFields && !Array.isArray(value.fields)) {
      return { error: 'Needs a "fields" list: { "fields": [ … ] }' };
    }
    if (requireFields && value.fields.some((field) => !field?.name || !field?.type)) {
      return { error: 'Every field needs a "name" and a "type".' };
    }
    return { value };
  } catch (error) {
    return { error: `Invalid JSON — ${error.message}` };
  }
}

/*
 * Developer page: create a block template (/dev/block-templates/new) or
 * edit one (/dev/block-templates/:templateId/edit), with a live preview
 * of the example data rendered by the real block component.
 */
function BlockTemplateFormPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEdit = Boolean(templateId);

  const [values, setValues] = useState({
    name: "",
    icon: "🧱",
    description: "",
    component: REGISTERED_COMPONENTS[0] || "",
    block_category_id: "",
    tags: "",
    status: "active",
    position: 0,
  });
  const [schemaText, setSchemaText] = useState(pretty(STARTER_SCHEMA));
  const [exampleText, setExampleText] = useState(pretty(STARTER_EXAMPLE));
  const [usageCount, setUsageCount] = useState(0);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [busy, setBusy] = useState(""); // "saving" | "deleting" | ""

  // Categories for the dropdown (managed on /dev/block-categories).
  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/dev/block-categories", { token })
      .then(({ block_categories: list }) => {
        if (cancelled) return;
        setCategories(list || []);
        // New templates start in the first active category.
        const firstActive = (list || []).find((category) => category.status === "active");
        setValues((current) =>
          current.block_category_id || !firstActive
            ? current
            : { ...current, block_category_id: String(firstActive.id) }
        );
      })
      .catch(() => {
        if (!cancelled) setGeneralError("Couldn't load block categories.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Edit mode: load the template.
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    apiRequest(`/api/dev/block-templates/${templateId}`, { token })
      .then(({ block_template: template }) => {
        if (cancelled) return;
        setValues({
          name: template.name || "",
          icon: template.icon || "",
          description: template.description || "",
          component: template.component || "",
          block_category_id: template.block_category_id ? String(template.block_category_id) : "",
          tags: (template.tags || []).join(", "),
          status: template.status || "active",
          position: template.position ?? 0,
        });
        setSchemaText(pretty(template.configuration_schema || { fields: [] }));
        setExampleText(pretty(template.example_data || {}));
        setUsageCount(template.learning_blocks_count ?? 0);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.status ? error.message : "Unable to connect to the server.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, templateId, token]);

  const schema = parseJson(schemaText, { requireFields: true });
  const selectedCategory =
    categories.find((category) => String(category.id) === values.block_category_id) || UNCATEGORISED;
  const example = parseJson(exampleText);
  const isRegistered = REGISTERED_COMPONENTS.includes(values.component);
  const componentOptions = isRegistered || !values.component
    ? REGISTERED_COMPONENTS
    : [values.component, ...REGISTERED_COMPONENTS];

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
    setGeneralError("");
  };
  const handleChange = (event) => setField(event.target.name, event.target.value);

  const formatJson = (text, setText) => {
    try {
      setText(pretty(JSON.parse(text)));
    } catch {
      // Leave invalid JSON as typed; the error is already shown.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const clientErrors = {};
    if (!values.name.trim()) clientErrors.name = "Give the template a name.";
    if (!values.component) clientErrors.component = "Choose the component that renders it.";
    if (!values.block_category_id) clientErrors.block_category_id = "Choose a category.";
    if (schema.error) clientErrors.configuration_schema = schema.error;
    if (example.error) clientErrors.example_data = example.error;
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      setGeneralError("Please fix the highlighted fields.");
      return;
    }

    const body = {
      ...values,
      position: Number(values.position) || 0,
      block_category_id: Number(values.block_category_id),
      tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      configuration_schema: schema.value,
      example_data: example.value,
    };

    setBusy("saving");
    setGeneralError("");
    try {
      await apiRequest(isEdit ? `/api/dev/block-templates/${templateId}` : "/api/dev/block-templates", {
        token,
        method: isEdit ? "PUT" : "POST",
        body,
      });
      navigate(LIST_PATH, {
        state: { flash: { tone: "good", text: `"${body.name.trim()}" ${isEdit ? "saved" : "created"}.` } },
      });
    } catch (error) {
      if (error.data?.errors) {
        // Nested schema errors (configuration_schema.fields.0.name) belong to the schema box.
        const mapped = fieldErrors(error.data.errors);
        const schemaKey = Object.keys(mapped).find((key) => key.startsWith("configuration_schema"));
        if (schemaKey) mapped.configuration_schema = mapped[schemaKey];
        setErrors(mapped);
        setGeneralError("Please fix the highlighted fields.");
      } else {
        setGeneralError(error.status ? error.message : "Unable to connect to the server.");
      }
      setBusy("");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the "${values.name}" template? This can't be undone.`)) return;

    setBusy("deleting");
    setGeneralError("");
    try {
      await apiRequest(`/api/dev/block-templates/${templateId}`, { token, method: "DELETE" });
      navigate(LIST_PATH, { state: { flash: { tone: "good", text: `"${values.name}" deleted.` } } });
    } catch (error) {
      // 409 = in use: the message tells the developer to deactivate instead.
      setGeneralError(error.status ? error.message : "Unable to connect to the server.");
      setBusy("");
    }
  };

  // Preview: title/icon are top-level block columns; the rest is block data.
  const previewBlock = example.value
    ? (() => {
        const { title, icon, ...data } = example.value;
        return { id: "template-preview", title, icon, data, block_template: { component: values.component } };
      })()
    : null;

  if (isLoading) {
    return (
      <div className="mx-page mx-create">
        <p className="mx-hint">Loading the template…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-page mx-create">
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🧭
          </span>
          <h2>Couldn't open this template</h2>
          <p>{loadError}</p>
          <Link className="mx-btn" to={LIST_PATH}>
            ← Back to block templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-page mx-create">
      <Link className="mx-back-link" to={LIST_PATH}>
        ← Back to block templates
      </Link>

      <header className="mx-create__head">
        <h1>{isEdit ? "Edit block template" : "New block template"}</h1>
        <p className="mx-hint">
          {isEdit
            ? usageCount > 0
              ? `Used by ${usageCount} learning block${usageCount === 1 ? "" : "s"} — changes apply to all of them.`
              : "Not used by any learning blocks yet."
            : "Define a block type teachers can add in the course builder."}
        </p>
      </header>

      <form className="mx-create__split" onSubmit={handleSubmit} noValidate>
        <div className="mx-form-card">
          {generalError && (
            <div className="mx-feedback mx-feedback--bad" role="alert">
              {generalError}
            </div>
          )}

          {/* ---------- basics ---------- */}
          <h2>📋 Basics</h2>
          <FormField id="tpl-name" label="Name" error={errors.name} hint="Shown to teachers in the block library.">
            <input name="name" type="text" maxLength={100} value={values.name} onChange={handleChange} placeholder="e.g. Flip Cards" />
          </FormField>

          <FormField id="tpl-icon" label="Icon" error={errors.icon}>
            <input name="icon" type="text" className="mx-icon-input" maxLength={8} value={values.icon} onChange={handleChange} />
          </FormField>

          <FormField id="tpl-description" label="Use it for" error={errors.description} hint="One or two sentences on when a teacher should pick this block.">
            <textarea name="description" maxLength={2000} value={values.description} onChange={handleChange} />
          </FormField>

          {/* ---------- rendering ---------- */}
          <h2>🧩 Rendering</h2>
          <div className="mx-inline-fields">
            <FormField
              id="tpl-component"
              label="Component"
              error={errors.component}
              hint={isRegistered ? "From the frontend block registry." : "⚠️ Not in the frontend block registry — blocks of this type can't render."}
            >
              <select name="component" value={values.component} onChange={handleChange}>
                {componentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                    {REGISTERED_COMPONENTS.includes(name) ? "" : " (missing)"}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="tpl-category"
              label="Category"
              error={errors.block_category_id}
              hint={<>Manage categories on the <Link to="/dev/block-categories">Categories</Link> page.</>}
            >
              <select name="block_category_id" value={values.block_category_id} onChange={handleChange}>
                {!values.block_category_id && <option value="">Choose a category…</option>}
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {categoryLabel(category)}
                    {category.status === "inactive" ? " (inactive)" : ""}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* ---------- library ---------- */}
          <h2>🏷️ Library</h2>
          <div className="mx-inline-fields">
            <FormField id="tpl-tags" label="Tags" error={errors.tags} hint="Comma-separated, for search.">
              <input name="tags" type="text" value={values.tags} onChange={handleChange} placeholder="cards, vocabulary" />
            </FormField>

            <FormField id="tpl-position" label="Position" error={errors.position} hint="Lower comes first.">
              <input name="position" type="number" min={0} max={9999} value={values.position} onChange={handleChange} />
            </FormField>
          </div>

          <div className="mx-status-options" role="radiogroup" aria-label="Status">
            {[
              { value: "active", label: "✅ Active", hint: "Teachers can add it." },
              { value: "inactive", label: "⏸️ Inactive", hint: "Hidden from the library; existing blocks keep working." },
            ].map((option) => (
              <label key={option.value} className={`mx-status-option${values.status === option.value ? " is-on" : ""}`}>
                <input
                  type="radio"
                  name="status"
                  className="mx-visually-hidden"
                  value={option.value}
                  checked={values.status === option.value}
                  onChange={handleChange}
                />
                <b>{option.label}</b>
                <span className="mx-hint">{option.hint}</span>
              </label>
            ))}
          </div>

          {/* ---------- schema ---------- */}
          <h2>🧾 Settings schema</h2>
          <p className="mx-hint mx-create__section-hint">
            The fields teachers fill in. Each needs a <code>name</code> and a <code>type</code>{" "}
            (text, textarea, number, boolean, select, repeater, code…).
          </p>
          <JsonBox
            id="tpl-schema"
            value={schemaText}
            onChange={setSchemaText}
            onFormat={() => formatJson(schemaText, setSchemaText)}
            error={errors.configuration_schema || schema.error}
            ok={schema.value && `${schema.value.fields.length} field${schema.value.fields.length === 1 ? "" : "s"}`}
          />

          {/* ---------- example data ---------- */}
          <h2>🧪 Example data</h2>
          <p className="mx-hint mx-create__section-hint">
            Starting content for new blocks, and what the preview shows. <code>title</code> and{" "}
            <code>icon</code> become the block's title and icon.
          </p>
          <JsonBox
            id="tpl-example"
            value={exampleText}
            onChange={setExampleText}
            onFormat={() => formatJson(exampleText, setExampleText)}
            error={errors.example_data || example.error}
            ok={example.value && "Valid JSON"}
          />

          <div className="mx-create__actions">
            <button className="mx-btn" type="submit" disabled={Boolean(busy)}>
              {busy === "saving" ? "Saving…" : isEdit ? "💾 Save changes" : "➕ Create template"}
            </button>
            <Link className="mx-btn mx-btn--ghost" to={LIST_PATH}>
              Cancel
            </Link>
            {isEdit && (
              <button type="button" className="mx-btn mx-btn--danger mx-templates__delete" disabled={Boolean(busy)} onClick={handleDelete}>
                {busy === "deleting" ? "Deleting…" : "🗑️ Delete"}
              </button>
            )}
          </div>
        </div>

        {/* ---------- live preview ---------- */}
        <aside className="mx-create__preview" aria-label="Live preview">
          <div className="mx-create__preview-label">Live preview · example data</div>
          <div className="mx-template-preview" style={{ "--w": selectedCategory.color }}>
            {previewBlock ? (
              <ErrorBoundary
                key={`${values.component}|${exampleText}`}
                fallback={(error) => (
                  <div className="mx-feedback mx-feedback--warn">
                    The preview failed to render with this example data: {error.message}
                  </div>
                )}
              >
                <LearningBlockRenderer block={previewBlock} />
              </ErrorBoundary>
            ) : (
              <p className="mx-hint">Fix the example data JSON to see a preview.</p>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}

/* Monospace JSON editor with a status line and a Format button. */
function JsonBox({ id, value, onChange, onFormat, error, ok }) {
  return (
    <div className={`mx-field mx-json-box${error ? " has-error" : ""}`}>
      <textarea
        id={id}
        className="mx-json-box__input"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-status`}
      />
      <div id={`${id}-status`} className="mx-json-box__status">
        <span className={error ? "mx-field__error" : "mx-field__hint"}>{error || `✓ ${ok}`}</span>
        <button type="button" className="mx-btn mx-btn--ghost mx-btn--sm" onClick={onFormat}>
          Format
        </button>
      </div>
    </div>
  );
}

export default BlockTemplateFormPage;
