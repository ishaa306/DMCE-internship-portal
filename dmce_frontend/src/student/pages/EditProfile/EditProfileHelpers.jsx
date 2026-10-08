import React from "react";

export const Section = ({ title, icon, children }) => (
  <div className="uvp-section">
    <h3 className="uvp-section-title">{icon} {title}</h3>
    {children}
  </div>
);

export const EditableItem = ({ label, children }) => (
  <div className="uvp-item">
    <div className="uvp-item-label">{label}</div>
    <div className="uvp-item-value">{children}</div>
  </div>
);

export const EditableInput = ({
  value,
  name,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  ...props
}) => (
  <input
    type={type}
    className="uvp-edit-input"
    name={name}
    value={value || ""}
    onChange={onChange}
    disabled={disabled}
    placeholder={
      disabled
        ? "Not Editable"
        : placeholder || "Enter value"
    }
    {...props}
  />
);

export const EditableTextArea = ({
  value,
  name,
  onChange,
  disabled = false,
  placeholder,
  ...props
}) => (
  <textarea
    className="uvp-edit-textarea"
    name={name}
    value={value || ""}
    onChange={onChange}
    disabled={disabled}
    placeholder={
      disabled
        ? "Not Editable"
        : placeholder || "Enter value"
    }
    {...props}
  />
);