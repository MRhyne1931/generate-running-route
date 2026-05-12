import React from 'react';
import './ConfirmDialog.css';

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog__overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="confirm-dialog__box">
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">Delete Route?</h2>
        <p className="confirm-dialog__message">
          Are you sure you want to delete this route? This action cannot be undone.
        </p>
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-dialog__btn confirm-dialog__btn--delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
