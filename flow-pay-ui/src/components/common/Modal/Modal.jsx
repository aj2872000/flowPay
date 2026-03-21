import "./Modal.css";

export default function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          {subtitle && <div className="modal__subtitle">{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ children }) {
  return <div className="modal__actions">{children}</div>;
}
